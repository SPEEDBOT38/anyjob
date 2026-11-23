"""Job discovery routes — JobSpy + Apify, deduplication, storage."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from .models import JobPosting, JobSearchRequest
from .storage import job_postings

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

SITE_ALIASES = {
    "linkedin": "linkedin",
    "indeed": "indeed",
    "ziprecruiter": "zip_recruiter",
    "zip_recruiter": "zip_recruiter",
    "glassdoor": "glassdoor",
    "seek": "seek",
    "naukri": "naukri",
    "hellowork": "hellowork",
    "bayt": "bayt",
    "bdjobs": "bdjobs",
}


def _job_id(url: str, site: str) -> str:
    return "job:" + hashlib.sha1(f"{site}|{url}".encode()).hexdigest()[:16]


def _clean(value: Any) -> Any:
    import math

    try:
        import numpy as np  # type: ignore
        import pandas as pd  # type: ignore
    except Exception:  # pragma: no cover
        np = None
        pd = None

    if value is None:
        return None
    if isinstance(value, bytes):
        return value.decode("utf-8", "replace")
    if isinstance(value, (str, int, float, bool)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return None
        return value
    if np is not None:
        if isinstance(value, (np.integer,)):
            return int(value)
        if isinstance(value, (np.floating,)):
            f = float(value)
            return None if (math.isnan(f) or math.isinf(f)) else f
        if isinstance(value, np.bool_):
            return bool(value)
        if isinstance(value, np.ndarray):
            return [_clean(v) for v in value.tolist()]
    if pd is not None:
        if isinstance(value, pd.Timestamp):
            return value.isoformat()
        if pd.isna(value):
            return None
    if isinstance(value, (list, tuple, set)):
        return [_clean(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _clean(v) for k, v in value.items()}
    return str(value)


def _normalize(job: dict) -> dict:
    url = job.get("job_url") or ""
    site = job.get("site")
    return {
        "external_id": _job_id(url, str(site or "")),
        "source": "jobspy",
        "source_url": url or None,
        "title": _clean(job.get("title") or ""),
        "company": _clean(job.get("company") or ""),
        "location": _clean(job.get("location") or ""),
        "employment_type": _clean(job.get("job_type") or ""),
        # Use the canonical JobPosting field names.  Keeping the JobSpy names
        # here silently discarded compensation data because Pydantic ignores
        # unknown fields by default.
        "salary_min": _clean(job.get("min_amount")),
        "salary_max": _clean(job.get("max_amount")),
        "salary_interval": _clean(job.get("interval") or ""),
        "description": _clean(job.get("description") or ""),
        "posted_date": _clean(str(job.get("date_posted"))) if job.get("date_posted") is not None else None,
        "extraction_quality": 0.9 if job.get("description") else 0.5,
        "is_active": True,
    }


@router.post("/search", status_code=status.HTTP_200_OK)
async def search_jobs(body: JobSearchRequest):
    """Search job boards via JobSpy, normalize, deduplicate, and store postings."""
    from jobspy import scrape_jobs

    sites = [s.strip() for s in body.sites.split(",") if s.strip()]
    invalid = [s for s in sites if s not in SITE_ALIASES]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Unknown site(s): {', '.join(invalid)}")
    resolved = [SITE_ALIASES[s] for s in sites]

    try:
        jobs = scrape_jobs(
            site_name=resolved,
            search_term=body.query,
            location=body.location or None,
            results_wanted=body.results_wanted,
            hours_old=body.hours_old,
            country_indeed=body.country_indeed,
            fetch_description=body.fetch_description,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Job search failed: {exc}")

    if jobs is None or len(jobs) == 0:
        return {"count": 0, "jobs": [], "query": body.query, "location": body.location, "stored": 0}

    records = jobs.to_dict("records") if hasattr(jobs, "to_dict") else []
    normalized = [_normalize(r) for r in records]

    # Deduplicate against stored postings by external_id + source_url.
    stored_count = 0
    stored_ids = []
    now = datetime.now(timezone.utc).isoformat()
    for n in normalized:
        existing = job_postings.query(external_id=n["external_id"], source="jobspy")
        if existing:
            # Update freshness.
            job_postings.update(existing[0].id, {"updated_at": now, "is_active": True})
            stored_ids.append(existing[0].id)
            continue
        posting = JobPosting(**n)
        created = job_postings.create(posting)
        stored_ids.append(created.id)
        stored_count += 1

    # Return stored JobPosting objects (with ids) so callers can reference them.
    stored_jobs = [job_postings.get(i) for i in stored_ids]
    return {
        "count": len(stored_jobs),
        "jobs": [j.model_dump() if hasattr(j, "model_dump") else j.dict() for j in stored_jobs],
        "query": body.query,
        "location": body.location,
        "stored": stored_count,
    }


@router.get("/search", status_code=status.HTTP_200_OK)
async def search_jobs_legacy(
    q: str = Query(..., min_length=1),
    location: str = "",
    site: str = "linkedin,indeed,zip_recruiter,glassdoor",
    results: int = Query(20, ge=1, le=100),
    hours_old: int = Query(72, ge=1, le=720),
    desc: bool = True,
):
    """Compatibility endpoint for older AnyJob browser builds.

    The SPA now uses POST /api/discovery/search, but preserving this adapter
    prevents a stale static deployment from failing with a confusing 404.
    """
    return await search_jobs(JobSearchRequest(
        query=q,
        location=location,
        sites=site,
        results_wanted=results,
        hours_old=hours_old,
        fetch_description=desc,
    ))


@router.get("/jobs", response_model=list[JobPosting])
def list_jobs(active_only: bool = Query(True)):
    if active_only:
        return job_postings.query(is_active=True)
    return job_postings.list()


@router.get("/jobs/{job_id}", response_model=JobPosting)
def get_job(job_id: str):
    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/jobs/{job_id}/deactivate", response_model=JobPosting)
def deactivate_job(job_id: str):
    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_postings.update(job_id, {"is_active": False})


@router.get("/apify/enrich/{job_id}")
async def apify_enrich(job_id: str):
    """Placeholder for Apify Actor enrichment of a single job posting.

    Wire an Apify Actor run here to fetch full description / missing fields
    for sources JobSpy cannot fully extract. Returns the enriched posting.
    """
    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # TODO: invoke Apify Actor (e.g. apify/linkedin-jobs-scraper) via Apify API
    # using APIFY_API_TOKEN env var, wait for run completion, merge dataset items.
    return {
        "job_id": job_id,
        "enriched": False,
        "note": "Apify enrichment not yet wired. Set APIFY_API_TOKEN and implement Actor call.",
    }
