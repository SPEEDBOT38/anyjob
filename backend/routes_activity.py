"""Agent activity log + scheduled discovery routes.

Activity log: observable, retryable event stream for everything the backend does.
Scheduled discovery: background thread that periodically runs JobSpy searches
according to the user's search profile and stores new postings.
"""

from __future__ import annotations

import threading
import time
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status

from .models import JobSearchRequest, SearchProfile
from .routes_discovery import SITE_ALIASES, _normalize, search_jobs as _discovery_search  # noqa: F401
from .storage import job_postings, search_profiles

router = APIRouter(prefix="/api/activity", tags=["activity"])

# In-memory activity log (bounded).
ACTIVITY_LOG: List[dict] = []
MAX_LOG = 500


def _log(action: str, detail: str, level: str = "info"):
    ACTIVITY_LOG.insert(0, {
        "at": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "detail": detail,
        "level": level,
    })
    if len(ACTIVITY_LOG) > MAX_LOG:
        ACTIVITY_LOG.pop()


# ---- Scheduler state ----
_scheduler_thread: Optional[threading.Thread] = None
_scheduler_stop = threading.Event()
_scheduler_running = False


def _run_discovery_cycle():
    """One discovery cycle: run configured searches, store new postings."""
    try:
        profiles = search_profiles.list()
        if not profiles:
            _log("scheduler", "No search profiles configured; skipping cycle.", "warn")
            return
        sp = profiles[0]
        roles = sp.target_roles or ["software engineer"]
        locations = sp.preferred_locations or [""]
        sites = ",".join(SITE_ALIASES.keys())
        for role in roles[:3]:
            for loc in locations[:2]:
                try:
                    # Reuse the discovery search logic via direct JobSpy call.
                    import asyncio
                    from jobspy import scrape_jobs
                    resolved = [SITE_ALIASES[s] for s in sites.split(",")]
                    jobs = scrape_jobs(
                        site_name=resolved,
                        search_term=role,
                        location=loc or None,
                        results_wanted=10,
                        hours_old=72,
                        country_indeed="USA",
                        fetch_description=True,
                    )
                    count = 0
                    if jobs is not None and len(jobs) > 0:
                        records = jobs.to_dict("records") if hasattr(jobs, "to_dict") else []
                        now = datetime.now(timezone.utc).isoformat()
                        for r in records:
                            n = _normalize(r)
                            existing = job_postings.query(external_id=n["external_id"], source="jobspy")
                            if existing:
                                job_postings.update(existing[0].id, {"updated_at": now, "is_active": True})
                                continue
                            from .models import JobPosting
                            job_postings.create(JobPosting(**n))
                            count += 1
                    _log("discovery", f"Searched '{role}' in '{loc or 'any'}': {count} new jobs stored.")
                except Exception as exc:  # noqa: BLE001
                    _log("discovery", f"Search failed for '{role}' in '{loc}': {exc}", "error")
    except Exception as exc:  # noqa: BLE001
        _log("scheduler", f"Cycle error: {exc}", "error")


def _scheduler_loop(interval_seconds: int):
    while not _scheduler_stop.is_set():
        _run_discovery_cycle()
        _scheduler_stop.wait(interval_seconds)


@router.get("/log")
def list_activity(limit: int = 100):
    """Return recent agent activity log entries."""
    return ACTIVITY_LOG[:limit]


@router.post("/scheduler/start")
def start_scheduler(body: dict):
    """Start the background discovery scheduler. interval_minutes default 60."""
    global _scheduler_thread, _scheduler_stop, _scheduler_running
    if _scheduler_running:
        return {"status": "already running"}
    interval_minutes = int(body.get("interval_minutes", 60))
    if interval_minutes < 5:
        interval_minutes = 5
    _scheduler_stop = threading.Event()
    _scheduler_thread = threading.Thread(
        target=_scheduler_loop, args=(interval_minutes * 60,), daemon=True
    )
    _scheduler_thread.start()
    _scheduler_running = True
    _log("scheduler", f"Started discovery scheduler (every {interval_minutes} min).")
    return {"status": "started", "interval_minutes": interval_minutes}


@router.post("/scheduler/stop")
def stop_scheduler():
    global _scheduler_running
    _scheduler_stop.set()
    _scheduler_running = False
    _log("scheduler", "Stopped discovery scheduler.")
    return {"status": "stopped"}


@router.get("/scheduler/status")
def scheduler_status():
    return {"running": _scheduler_running}
