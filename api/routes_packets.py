"""Application packet routes — link job → resume version → status tracker."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status

from .models import Application, ApplicationStatus
from .storage import applications, job_postings, resume_versions

router = APIRouter(prefix="/api/packets", tags=["packets"])


def _event(app: Application, action: str, detail: str = "") -> None:
    app.events.append({
        "at": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "detail": detail,
    })


@router.post("/", response_model=Application, status_code=status.HTTP_201_CREATED)
def create_packet(body: dict):
    """Create an application packet linking a job to an approved resume version."""
    job_id = body.get("job_id")
    resume_version_id = body.get("resume_version_id")
    cover_letter = body.get("cover_letter")

    if not job_id:
        raise HTTPException(status_code=400, detail="job_id required")
    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if resume_version_id:
        rv = resume_versions.get(resume_version_id)
        if not rv:
            raise HTTPException(status_code=404, detail="Resume version not found")
        if not rv.user_approved:
            raise HTTPException(status_code=400, detail="Resume version must be user-approved before creating a packet.")

    app = Application(
        job_id=job_id,
        resume_version_id=resume_version_id,
        cover_letter=cover_letter,
        status=ApplicationStatus.READY_FOR_REVIEW,
    )
    _event(app, "created", f"Packet for {job.title} at {job.company}")
    applications.create(app)
    return app


@router.get("/", response_model=list[Application])
def list_packets(status: Optional[str] = None):
    if status:
        return applications.query(status=status)
    return applications.list()


@router.get("/{packet_id}", response_model=Application)
def get_packet(packet_id: str):
    app = applications.get(packet_id)
    if not app:
        raise HTTPException(status_code=404, detail="Packet not found")
    # Enrich with job + resume info.
    job = job_postings.get(app.job_id)
    rv = resume_versions.get(app.resume_version_id) if app.resume_version_id else None
    return {
        **app.model_dump(),
        "job": job.model_dump() if job else None,
        "resume_version": rv.model_dump() if rv else None,
    }


@router.patch("/{packet_id}/status", response_model=Application)
def update_status(packet_id: str, body: dict):
    new_status = body.get("status")
    if new_status not in [s.value for s in ApplicationStatus]:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {[s.value for s in ApplicationStatus]}")
    app = applications.get(packet_id)
    if not app:
        raise HTTPException(status_code=404, detail="Packet not found")
    app.status = new_status  # type: ignore[assignment]
    app.updated_at = datetime.now(timezone.utc).isoformat()
    if new_status == ApplicationStatus.SUBMITTED.value:
        app.applied_at = datetime.now(timezone.utc).isoformat()
        _event(app, "submitted", "Application submitted")
    else:
        _event(app, "status_changed", f"→ {new_status}")
    return applications.update(packet_id, app.model_dump())


@router.patch("/{packet_id}/notes", response_model=Application)
def update_notes(packet_id: str, body: dict):
    app = applications.get(packet_id)
    if not app:
        raise HTTPException(status_code=404, detail="Packet not found")
    app.user_notes = body.get("notes", "")
    app.updated_at = datetime.now(timezone.utc).isoformat()
    _event(app, "notes_updated", "User notes updated")
    return applications.update(packet_id, app.model_dump())


@router.delete("/{packet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_packet(packet_id: str):
    ok = applications.delete(packet_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Packet not found")
    return None
