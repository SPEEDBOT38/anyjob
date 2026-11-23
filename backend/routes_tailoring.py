"""Evidence-grounded tailoring routes — AI tailors resume to JD with honesty constraints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status

from .models import (
    AIProvider,
    MatchAssessment,
    ResumeType,
    ResumeVersion,
    SearchProfile,
)
from .storage import (
    applications,
    job_postings,
    match_assessments,
    profiles,
    resume_versions,
    search_profiles,
)

router = APIRouter(prefix="/api/tailoring", tags=["tailoring"])

HONESTY = (
    "Never invent a company, employer, date, number, metric, skill, tool, or achievement. "
    "Use only facts from the candidate's verified career profile and their own answers. "
    "If something is not in the profile, leave it out or mark it as needing confirmation."
)

CV_SHAPE = (
    '{"name":"","headline":"","contact":[""],"summary":"","skills":[""],'
    '"experience":[{"title":"","org":"","dates":"","bullets":[]}],'
    '"education":[{"degree":"","institution":"","dates":""}],'
    '"projects":[{"name":"","description":"","technologies":[]}],'
    '"certifications":[]}'
)


def _latex_escape(value: object) -> str:
    """Escape profile/AI text before placing it into LaTeX source."""
    replacements = {
        "\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$",
        "#": r"\#", "_": r"\_", "{": r"\{", "}": r"\}",
        "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(char, char) for char in str(value or ""))


def _build_profile_text(profile) -> str:
    parts = []
    if profile.full_name:
        parts.append(f"Name: {profile.full_name}")
    if profile.headline:
        parts.append(f"Headline: {profile.headline}")
    if profile.summary:
        parts.append(f"Summary: {profile.summary}")
    contact = []
    if profile.email:
        contact.append(profile.email)
    if profile.phone:
        contact.append(profile.phone)
    if profile.location:
        contact.append(profile.location)
    if contact:
        parts.append(f"Contact: {', '.join(contact)}")
    if profile.skills:
        parts.append(f"Skills: {', '.join(s.name for s in profile.skills)}")
    if profile.experience:
        parts.append("Experience:")
        for e in profile.experience:
            parts.append(f"- {e.title} at {e.org} ({e.dates}): {'; '.join(e.bullets)}")
    if profile.education:
        parts.append("Education:")
        for e in profile.education:
            parts.append(f"- {e.degree} at {e.institution} ({e.dates})")
    if profile.projects:
        parts.append("Projects:")
        for p in profile.projects:
            parts.append(f"- {p.name}: {p.description} ({', '.join(p.technologies)})")
    return "\n".join(parts)


def _build_tailor_prompt(profile, job, match, resume_type: str, mode: str) -> str:
    profile_text = _build_profile_text(profile)
    jd = job.description or ""
    reqs = match.matched_requirements or []
    missing = match.missing_evidence or []

    mode_instructions = {
        "conservative": "Preserve most of the original wording. Adjust order, summary, and bullet emphasis for relevance. Minimal rewriting.",
        "balanced": "Rewrite existing bullets for clarity and stronger alignment while preserving all facts. Reorder experience by relevance.",
        "comprehensive": "Reconstruct the resume using the full verified career profile and the chosen resume strategy, tailoring every section to the job.",
    }

    return f"""You are an expert resume writer. {HONESTY}

Create a {resume_type} resume tailored to this job.

CANDIDATE'S VERIFIED CAREER PROFILE:
{profile_text}

TARGET JOB:
Title: {job.title}
Company: {job.company}
Location: {job.location}
Description: {jd[:3000]}

MATCHED REQUIREMENTS (evidence exists in profile):
{chr(10).join(f"- {r}" for r in reqs) if reqs else "- none"}

MISSING EVIDENCE (JD asks, profile does not confirm — do NOT invent):
{chr(10).join(f"- {m}" for m in missing) if missing else "- none"}

Resume type: {resume_type} — {_resume_type_desc(resume_type)}
Generation mode: {mode} — {mode_instructions.get(mode, mode_instructions['balanced'])}

Return JSON only: {CV_SHAPE}

Include sections: Professional Summary, Core Competencies/Skills, Professional Experience (with quantifiable achievements from profile only), Education, Projects (if any), Certifications (if any).
Tailor to the job category and description using only verified facts. Lead bullets with results. Do not add any skill, employer, date, or number not present in the profile.
"""


def _resume_type_desc(resume_type: str) -> str:
    return {
        "chronological": "Lists work experience in reverse chronological order. Best for consistent career progression.",
        "functional": "Emphasizes skills over work history. Best for career changers or employment gaps.",
        "combination": "Balances chronological history with skill-based sections. Best for experienced professionals.",
        "targeted": "Customized specifically for a particular job application.",
    }.get(resume_type, "Standard professional resume.")


def _call_ai(system: str, user: str, profile, search_profile) -> dict:
    """Call kilocode (primary) or Gemini (fallback). Returns parsed JSON dict."""
    import json as _json

    provider = (search_profile.ai_provider if search_profile else AIProvider.KILOCODE)
    api_key = None
    endpoint = None
    model = "kilocode"

    if search_profile:
        if provider == AIProvider.KILOCODE:
            api_key = search_profile.kilocode_api_key
            endpoint = search_profile.kilocode_endpoint or "https://api.kilocode.ai/v1/chat/completions"
            model = search_profile.kilocode_model or "kilocode"
        else:
            api_key = search_profile.gemini_api_key

    text = None
    used = "gemini"

    if provider == AIProvider.KILOCODE and api_key:
        try:
            import httpx  # type: ignore
            with httpx.Client(timeout=60) as client:
                resp = client.post(
                    endpoint,
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
                    json={"model": model, "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ], "temperature": 0.4},
                )
            if resp.status_code == 200:
                body = resp.json()
                text = (body.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
                used = "kilocode"
            else:
                raise RuntimeError(f"Kilocode status {resp.status_code}")
        except Exception:
            text = None  # fall through to Gemini

    if text is None and search_profile and search_profile.gemini_api_key:
        try:
            import httpx  # type: ignore
            with httpx.Client(timeout=60) as client:
                resp = client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{search_profile.kilocode_model or 'gemini-3.1-flash-lite'}:generateContent",
                    headers={"Content-Type": "application/json", "x-goog-api-key": search_profile.gemini_api_key},
                    json={"systemInstruction": {"parts": [{"text": system}]},
                          "contents": [{"role": "user", "parts": [{"text": user}]}],
                          "generationConfig": {"responseMimeType": "application/json"}},
                )
            if resp.status_code == 200:
                body = resp.json()
                parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                text = "".join(p.get("text", "") for p in parts if not p.get("thought")).strip()
                used = "gemini"
            else:
                raise RuntimeError(f"Gemini status {resp.status_code}")
        except Exception:
            text = None

    if not text:
        raise HTTPException(status_code=502, detail="AI provider returned empty content. Configure a kilocode or Gemini key in Settings.")

    # Parse JSON from response.
    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return _json.loads(cleaned), used
    except Exception:
        a = cleaned.find("{")
        b = cleaned.rfind("}")
        if a >= 0 and b > a:
            try:
                return _json.loads(cleaned[a:b + 1]), used
            except Exception:
                pass
        raise HTTPException(status_code=502, detail="AI returned unparseable content. Click again.")


@router.post("/generate", response_model=ResumeVersion, status_code=status.HTTP_200_OK)
def generate_tailored_resume(body: dict):
    """Generate a tailored resume version for a job + profile. Returns ResumeVersion (unapproved)."""
    job_id = body.get("job_id")
    profile_id = body.get("profile_id")
    resume_type = body.get("resume_type", "chronological")
    template = body.get("template", "classic")
    mode = body.get("generation_mode", "balanced")

    if not job_id or not profile_id:
        raise HTTPException(status_code=400, detail="job_id and profile_id required")

    job = job_postings.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    profile = profiles.get(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if profile.needs_review:
        raise HTTPException(status_code=400, detail="Profile needs review/confirmation before tailoring.")

    # Get or create match assessment.
    existing = match_assessments.query(job_id=job_id, profile_id=profile_id)
    match = existing[0] if existing else None

    # Get search profile for AI provider config.
    sps = search_profiles.list()
    search_profile = sps[0] if sps else None

    system = (
        "You are an expert resume writer. " + HONESTY +
        " Return JSON only in the requested CV shape. Every claim must be traceable to the profile."
    )
    user = _build_tailor_prompt(profile, job, match, resume_type, mode)

    cv_json, ai_used = _call_ai(system, user, profile, search_profile)

    # Sanitize + build text outputs.
    name = cv_json.get("name") or profile.full_name or ""
    headline = cv_json.get("headline") or profile.headline or ""
    summary = cv_json.get("summary") or profile.summary or ""
    skills = [s for s in cv_json.get("skills", []) if s]
    experience = cv_json.get("experience", [])
    education = cv_json.get("education", [])
    projects = cv_json.get("projects", [])
    certs = cv_json.get("certifications", [])

    # Build TXT content.
    lines = []
    if name:
        lines.append(name)
        lines.append("")
    if headline:
        lines.append(headline)
        lines.append("")
    if summary:
        lines.append("PROFESSIONAL SUMMARY")
        lines.append(summary)
        lines.append("")
    if skills:
        lines.append("CORE COMPETENCIES")
        lines.append(", ".join(skills))
        lines.append("")
    if experience:
        lines.append("PROFESSIONAL EXPERIENCE")
        for e in experience:
            title = e.get("title", "")
            org = e.get("org", "")
            dates = e.get("dates", "")
            lines.append(f"{title} at {org} ({dates})".strip(" ()"))
            for b in e.get("bullets", []):
                lines.append(f"- {b}")
            lines.append("")
    if education:
        lines.append("EDUCATION")
        for e in education:
            lines.append(f"{e.get('degree','')} at {e.get('institution','')} ({e.get('dates','')})".strip(" ()"))
        lines.append("")
    if projects:
        lines.append("PROJECTS")
        for p in projects:
            lines.append(f"{p.get('name','')}: {p.get('description','')}")
        lines.append("")
    if certs:
        lines.append("CERTIFICATIONS")
        lines.append(", ".join(str(c) for c in certs))
        lines.append("")

    content_txt = "\n".join(lines).strip()

    # Build LaTeX content.
    tex_lines = [
        "\\documentclass[11pt,a4paper]{article}",
        "\\usepackage[margin=0.7in]{geometry}",
        "\\usepackage[T1]{fontenc}",
        "\\usepackage[hidelinks]{hyperref}",
        "\\usepackage{enumitem}",
        "\\setlist{nosep,leftmargin=1.2em}",
        "\\pagestyle{empty}",
        "\\setlength{\\parindent}{0pt}",
        "\\begin{document}",
    ]
    if name:
        tex_lines.append(r"{\LARGE\textbf{" + _latex_escape(name) + r"}}\\[4pt]")
    if headline:
        tex_lines.append(_latex_escape(headline) + "\\\\")
    tex_lines.append(r"\section*{Professional Summary}")
    tex_lines.append(_latex_escape(summary) + "\\\\")
    if skills:
        tex_lines.append(r"\section*{Core Competencies}")
        tex_lines.append(_latex_escape(", ".join(skills)) + "\\\\")
    if experience:
        tex_lines.append(r"\section*{Professional Experience}")
        for e in experience:
            tex_lines.append(r"\textbf{" + _latex_escape(e.get('title', '')) + r"} at " + _latex_escape(e.get('org', '')) + r" \hfill " + _latex_escape(e.get('dates', '')) + r"\\")
            tex_lines.append(r"\begin{itemize}")
            for b in e.get("bullets", []):
                tex_lines.append(r"\item " + _latex_escape(b))
            tex_lines.append(r"\end{itemize}")
    if education:
        tex_lines.append(r"\section*{Education}")
        for e in education:
            tex_lines.append(r"\textbf{" + _latex_escape(e.get('degree', '')) + r"} at " + _latex_escape(e.get('institution', '')) + r" \hfill " + _latex_escape(e.get('dates', '')) + r"\\")
    tex_lines.append("\\end{document}")
    content_tex = "\n".join(tex_lines)

    # Build markdown content.
    content_md = f"# {name}\n\n"
    if headline:
        content_md += f"*{headline}*\n\n"
    if summary:
        content_md += f"## Professional Summary\n\n{summary}\n\n"
    if skills:
        content_md += f"## Core Competencies\n\n{', '.join(skills)}\n\n"
    if experience:
        content_md += "## Professional Experience\n\n"
        for e in experience:
            content_md += f"### {e.get('title','')} at {e.get('org','')} ({e.get('dates','')})\n\n"
            for b in e.get("bullets", []):
                content_md += f"- {b}\n"
            content_md += "\n"

    version = ResumeVersion(
        job_id=job_id,
        profile_id=profile_id,
        match_id=match.id if match else None,
        resume_type=resume_type,
        template=template,
        title=f"{name} — {job.title} at {job.company}",
        content_txt=content_txt,
        content_tex=content_tex,
        content_markdown=content_md,
        ai_provider_used=ai_used,  # type: ignore[arg-type]
        user_approved=False,
    )
    resume_versions.create(version)
    return version


@router.post("/versions/{version_id}/approve", response_model=ResumeVersion)
def approve_version(version_id: str):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    version.user_approved = True
    version.approved_at = datetime.now(timezone.utc).isoformat()
    return resume_versions.update(version_id, version.model_dump())


@router.get("/versions/{version_id}", response_model=ResumeVersion)
def get_version(version_id: str):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return version


@router.get("/profiles/{profile_id}/versions", response_model=list[ResumeVersion])
def list_versions_for_profile(profile_id: str):
    return resume_versions.query(profile_id=profile_id)
