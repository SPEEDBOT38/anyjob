"""Master Career Profile routes — resume ingestion + structured profile CRUD."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from .ingestion import extract_resume_text
from .models import CareerProfile, ResumeUploadRequest, SearchProfile
from .storage import profiles, search_profiles

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_resume(
    file: UploadFile = File(...),
    profile_id: Optional[str] = Form(None),
    file_format: Optional[str] = Form(None),
):
    """Upload a resume (PDF, DOCX, TXT, LaTeX). Extract text and return ingestion result
    so the frontend can show what was understood and ask the user to confirm/correct."""
    data = await file.read()

    fmt = file_format or (file.filename.rsplit(".", 1)[-1] if file.filename else "txt")
    fmt = fmt.lower()
    if fmt == "pdf":
        fmt = "pdf"
    elif fmt in ("docx", "doc"):
        fmt = "docx"
    elif fmt == "txt":
        fmt = "txt"
    elif fmt in ("tex", "latex"):
        fmt = "tex"
    else:
        fmt = "txt"

    result = extract_resume_text(data, fmt)

    # If a profile_id is given, attach source text to that profile.
    pid = profile_id
    if pid:
        prof = profiles.get(pid)
        if prof:
            prof.source_resume_text = result.text
            prof.source_resume_format = fmt
            prof.parsing_confidence = result.confidence
            prof.needs_review = True
            prof.updated_at = datetime.utcnow()
            profiles.update(pid, prof.model_dump())

    return {
        "profile_id": pid,
        "format": result.format,
        "is_scanned": result.is_scanned,
        "char_count": result.char_count,
        "word_count": result.word_count,
        "confidence": result.confidence,
        "text": result.text,
        "notes": result.notes,
        "needs_review": result.is_scanned or result.confidence < 0.7,
    }


@router.post("/profiles", response_model=CareerProfile, status_code=status.HTTP_201_CREATED)
def create_profile(profile: CareerProfile):
    return profiles.create(profile)


@router.get("/profiles", response_model=list[CareerProfile])
def list_profiles():
    return profiles.list()


@router.get("/profiles/{profile_id}", response_model=CareerProfile)
def get_profile(profile_id: str):
    prof = profiles.get(profile_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof


@router.put("/profiles/{profile_id}", response_model=CareerProfile)
def update_profile(profile_id: str, patch: dict):
    prof = profiles.update(profile_id, patch)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(profile_id: str):
    ok = profiles.delete(profile_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Profile not found")
    return None


@router.post("/profiles/{profile_id}/confirm", response_model=CareerProfile)
def confirm_profile(profile_id: str):
    """Mark a profile as user-confirmed (no longer needs review)."""
    prof = profiles.get(profile_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    prof.needs_review = False
    return profiles.update(profile_id, {"needs_review": False})


@router.get("/search-profiles", response_model=list[SearchProfile])
def list_search_profiles():
    return search_profiles.list()


@router.post("/search-profiles", response_model=SearchProfile, status_code=status.HTTP_201_CREATED)
def create_search_profile(profile: SearchProfile):
    return search_profiles.create(profile)


@router.put("/search-profiles/{search_profile_id}", response_model=SearchProfile)
def update_search_profile(search_profile_id: str, patch: dict):
    profile = search_profiles.update(search_profile_id, patch)
    if not profile:
        raise HTTPException(status_code=404, detail="Search profile not found")
    return profile
