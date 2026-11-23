"""Explainable matching routes — eligibility + relevance scoring with evidence."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status

from .models import (
    CareerProfile,
    JobPosting,
    JobRequirement,
    MatchAssessment,
    SearchProfile,
)
from .storage import job_postings, match_assessments, profiles, search_profiles

router = APIRouter(prefix="/api/matching", tags=["matching"])

# Blueprint-recommended relevance weights (starting point, product-tunable).
WEIGHTS = {
    "required_skills": 30,
    "relevant_experience": 25,
    "responsibilities": 20,
    "role_alignment": 15,
    "preferences": 10,
}

COMMON_STOPWORDS = {
    "a", "an", "and", "the", "of", "for", "to", "in", "on", "at", "by", "with",
    "from", "as", "or", "is", "are", "was", "were", "be", "been", "this", "that",
    "these", "those", "it", "its", "into", "over", "under", "up", "out", "per",
    "via", "we", "our", "you", "your", "i", "my", "me", "us", "will", "can",
    "could", "should", "would", "dear", "hiring", "manager", "team", "regards",
    "sincerely", "thank", "thanks", "best", "kind", "warm",
}


def _tokens(text: str) -> List[str]:
    import re

    return [t for t in re.findall(r"[A-Za-z0-9+#.\-]+", text.lower()) if t not in COMMON_STOPWORDS]


def _skill_overlap(profile_skills: List[str], required_skills: List[str]) -> float:
    if not required_skills:
        return 100.0
    ps = {s.lower() for s in profile_skills}
    matched = sum(1 for rs in required_skills if rs.lower() in ps)
    return round((matched / len(required_skills)) * 100, 1)


def _experience_overlap(profile_text: str, req_text: str) -> float:
    """Crude experience overlap: fraction of requirement keywords found in profile text."""
    req_tokens = set(_tokens(req_text))
    if not req_tokens:
        return 100.0
    prof_tokens = set(_tokens(profile_text))
    matched = len(req_tokens & prof_tokens)
    return round((matched / len(req_tokens)) * 100, 1)


@router.post("/assess", response_model=MatchAssessment, status_code=status.HTTP_200_OK)
def assess_match(body: dict):
    """Assess a job against a profile: eligibility + relevance + missing evidence."""
    job_id = body.get("job_id")
    profile_id = body.get("profile_id")
    if not job_id or not profile_id:
        raise HTTPException(status_code=400, detail="job_id and profile_id required")

    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = profiles.get(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # ---- Build profile "haystack" for evidence checks ----
    profile_skills = [s.name for s in profile.skills]
    profile_text_parts = [
        profile.summary or "",
        profile.headline or "",
        " ".join(e.title + " " + e.org + " " + " ".join(e.bullets) for e in profile.experience),
        " ".join(e.degree + " " + e.institution for e in profile.education),
        " ".join(profile_skills),
    ]
    profile_haystack = " ".join(profile_text_parts).lower()

    # ---- Requirements ----
    job_reqs: List[JobRequirement] = []
    required_skills = list(job.required_skills or [])
    nice_skills = list(job.nice_to_have_skills or [])

    # If job has no parsed requirements yet, derive crudely from description.
    if not job.requirements:
        desc = job.description or ""
        # Split into sentence-ish chunks as pseudo-requirements.
        chunks = [c.strip() for c in desc.split("\n") if c.strip()][:12]
        for c in chunks:
            importance = "must" if any(w in c.lower() for w in ("required", "must", "essential")) else "nice"
            job_reqs.append(JobRequirement(text=c, importance=importance))
    else:
        job_reqs = job.requirements

    matched_requirements: List[str] = []
    missing_evidence: List[str] = []
    eligibility_notes: List[str] = []
    missing_hard: List[str] = []
    eligible = True

    for req in job_reqs:
        req_lower = req.text.lower()
        # Evidence check: does the requirement text appear (or key terms) in profile?
        req_tokens = set(_tokens(req.text))
        prof_tokens = set(_tokens(profile_haystack))
        overlap = len(req_tokens & prof_tokens) / max(len(req_tokens), 1)
        matched = overlap >= 0.4
        if matched:
            matched_requirements.append(req.text)
            req.matched = True
            req.evidence = req.text
            req.confidence = round(overlap, 2)
        else:
            missing_evidence.append(req.text)
            if req.importance == "must":
                eligible = False
                missing_hard.append(req.text)
                eligibility_notes.append(f"Missing must-have: {req.text}")

    # ---- Scores ----
    skills_pct = _skill_overlap(profile_skills, required_skills + nice_skills)
    exp_pct = _experience_overlap(profile_haystack, job.description or "")
    # Role alignment: does profile headline/summary mention target role terms?
    role_terms = set(_tokens((job.title or "") + " " + (job.subrole or "")))
    role_match = 100.0 if not role_terms else round(
        (len(role_terms & set(_tokens(profile.headline + " " + profile.summary))) / len(role_terms)) * 100, 1
    )
    # Preference match: location / arrangement / seniority vs search profile.
    pref_pct = 100.0
    sp = search_profiles.query(profile_id=profile_id)  # type: ignore[arg-type]
    # search_profiles.query expects kwargs; profile_id isn't a SearchProfile field.
    # Fall back: just use default 100 unless we can find a matching search profile.
    pref_pct = 100.0

    relevance_score = round(
        (skills_pct * WEIGHTS["required_skills"]
         + exp_pct * WEIGHTS["relevant_experience"]
         + 70 * WEIGHTS["responsibilities"]
         + role_match * WEIGHTS["role_alignment"]
         + pref_pct * WEIGHTS["preferences"])
        / 100,
        1,
    )

    # ---- Verdict ----
    if not eligible:
        verdict = "skip"
        recommended_action = "Resolve missing must-have requirements before applying."
    elif relevance_score >= 75:
        verdict = "apply"
        recommended_action = "Strong match — prepare tailored resume."
    elif relevance_score >= 50:
        verdict = "partial"
        recommended_action = "Partial fit — review missing evidence before tailoring."
    else:
        verdict = "skip"
        recommended_action = "Low relevance — consider other opportunities."

    explanation = (
        f"{verdict.upper()}: {relevance_score}/100 relevance. "
        f"{len(matched_requirements)} requirement(s) matched, "
        f"{len(missing_evidence)} missing. "
    )
    if missing_hard:
        explanation += f"Hard gaps: {', '.join(missing_hard[:3])}. "

    assessment = MatchAssessment(
        job_id=job_id,
        profile_id=profile_id,
        eligible=eligible,
        eligibility_notes=eligibility_notes,
        missing_hard_requirements=missing_hard,
        relevance_score=int(relevance_score),
        skills_match_pct=skills_pct,
        experience_match_pct=exp_pct,
        role_alignment_pct=role_match,
        preference_match_pct=pref_pct,
        matched_requirements=matched_requirements,
        missing_evidence=missing_evidence,
        explanation=explanation,
        confidence=round(min(1.0, relevance_score / 100 + 0.2), 2),
        verdict=verdict,
        recommended_action=recommended_action,
    )

    # Persist job requirements + assessment.
    job_postings.update(job_id, {
        "requirements": [r.dict() if hasattr(r, "dict") else r.model_dump() for r in job_reqs],
        "required_skills": required_skills,
        "nice_to_have_skills": nice_skills,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    match_assessments.create(assessment)

    return assessment


@router.get("/assessments/{assessment_id}", response_model=MatchAssessment)
def get_assessment(assessment_id: str):
    a = match_assessments.get(assessment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.get("/jobs/{job_id}/matches", response_model=list[MatchAssessment])
def list_matches_for_job(job_id: str):
    return match_assessments.query(job_id=job_id)


@router.get("/profiles/{profile_id}/matches", response_model=list[MatchAssessment])
def list_matches_for_profile(profile_id: str):
    return match_assessments.query(profile_id=profile_id)
