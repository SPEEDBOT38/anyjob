"""Resume rendering routes — TXT, LaTeX, PDF, DOCX + PDF QA validation."""

from __future__ import annotations

import io
import os
import re
import textwrap
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from .models import ResumeVersion
from .storage import resume_versions

router = APIRouter(prefix="/api/rendering", tags=["rendering"])

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def _sanitize_filename(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", name) or "resume"


def _build_docx(content_txt: str, title: str) -> bytes:
    from docx import Document  # type: ignore
    from docx.shared import Pt  # type: ignore

    doc = Document()
    # Title
    if title:
        h = doc.add_heading(title, level=0)
    for line in content_txt.split("\n"):
        if not line.strip():
            doc.add_paragraph("")
        elif line.isupper() and len(line) < 60:
            doc.add_heading(line, level=1)
        else:
            doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def _build_pdf(content_txt: str, title: str) -> bytes:
    """Build a simple PDF from text using reportlab if available, else fallback."""
    try:
        from reportlab.lib.pagesizes import A4  # type: ignore
        from reportlab.lib.units import mm  # type: ignore
        from reportlab.pdfgen import canvas  # type: ignore
    except Exception as exc:
        raise HTTPException(
            status_code=501,
            detail=f"PDF rendering requires reportlab. Install: pip install reportlab. ({exc})",
        )

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    y = height - margin
    c.setFont("Helvetica", 10)
    if title:
        c.drawString(margin, y, title[:90])
        y -= 12
    c.setFont("Helvetica", 9)
    for line in content_txt.split("\n"):
        # Truncating at 95 characters produced incomplete resumes. Wrap each
        # line instead, retaining every approved statement in the export.
        for wrapped in textwrap.wrap(line, width=105, replace_whitespace=False) or [""]:
            if y < margin:
                c.showPage()
                c.setFont("Helvetica", 9)
                y = height - margin
            c.drawString(margin, y, wrapped)
            y -= 11
    c.save()
    return buf.getvalue()


def _qa_validate_pdf(pdf_bytes: bytes, intended_txt: str) -> dict:
    """PDF QA: extract text back from PDF and check critical fields are present."""
    checks = {}
    notes = []

    try:
        import PyPDF2  # type: ignore
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        extracted = "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception as exc:
        return {"passed": False, "checks": {"extraction": False}, "notes": [f"PDF extraction failed: {exc}"]}

    # Critical fields to verify: name-ish tokens, section headings, key skills.
    critical_tokens = ["experience", "education", "skills", "summary"]
    for tok in critical_tokens:
        checks[f"has_{tok}"] = tok.lower() in extracted.lower()

    # Check a few distinctive words from intended text survived.
    sample_words = [w for w in re.findall(r"[A-Za-z]{4,}", intended_txt)[:15]]
    missing_words = [w for w in sample_words if w.lower() not in extracted.lower()]
    checks["text_integrity"] = len(missing_words) == 0
    if missing_words:
        notes.append(f"Words possibly lost in PDF: {', '.join(missing_words[:5])}")

    checks["pages"] = len(reader.pages) >= 1
    passed = all(checks.values())
    return {"passed": passed, "checks": checks, "notes": notes}


@router.api_route("/versions/{version_id}/txt", methods=["GET", "POST"])
def render_txt(version_id: str):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return {
        "version_id": version_id,
        "format": "txt",
        "content": version.content_txt,
        "filename": f"{_sanitize_filename(version.title or 'resume')}.txt",
    }


@router.api_route("/versions/{version_id}/tex", methods=["GET", "POST"])
def render_tex(version_id: str):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return {
        "version_id": version_id,
        "format": "tex",
        "content": version.content_tex,
        "filename": f"{_sanitize_filename(version.title or 'resume')}.tex",
    }


@router.api_route("/versions/{version_id}/docx", methods=["GET", "POST"])
def render_docx(version_id: str):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
    pdf_bytes = _build_docx(version.content_txt, version.title or "Resume")
    fname = f"{_sanitize_filename(version.title or 'resume')}.docx"
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "wb") as f:
        f.write(pdf_bytes)
    version.output_docx = path
    resume_versions.update(version_id, version.model_dump())
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@router.api_route("/versions/{version_id}/pdf", methods=["GET", "POST"])
def render_pdf(version_id: str, qa: bool = Query(True, description="Run PDF QA validation")):
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")

    pdf_bytes = _build_pdf(version.content_txt, version.title or "Resume")

    qa_result = None
    if qa:
        qa_result = _qa_validate_pdf(pdf_bytes, version.content_txt)
        version.qa_passed = qa_result["passed"]
        version.qa_checks = qa_result["checks"]
        version.qa_notes = qa_result["notes"]

    fname = f"{_sanitize_filename(version.title or 'resume')}.pdf"
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "wb") as f:
        f.write(pdf_bytes)
    version.output_pdf = path
    resume_versions.update(version_id, version.model_dump())

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@router.post("/versions/{version_id}/all")
def render_all(version_id: str):
    """Render TXT, LaTeX, DOCX, PDF and return metadata + QA."""
    version = resume_versions.get(version_id)
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")

    # TXT + TEX already stored.
    # DOCX
    docx_bytes = _build_docx(version.content_txt, version.title or "Resume")
    docx_name = f"{_sanitize_filename(version.title or 'resume')}.docx"
    docx_path = os.path.join(OUTPUT_DIR, docx_name)
    with open(docx_path, "wb") as f:
        f.write(docx_bytes)

    # PDF + QA
    pdf_bytes = _build_pdf(version.content_txt, version.title or "Resume")
    qa_result = _qa_validate_pdf(pdf_bytes, version.content_txt)
    pdf_name = f"{_sanitize_filename(version.title or 'resume')}.pdf"
    pdf_path = os.path.join(OUTPUT_DIR, pdf_name)
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    version.output_docx = docx_path
    version.output_pdf = pdf_path
    version.qa_passed = qa_result["passed"]
    version.qa_checks = qa_result["checks"]
    version.qa_notes = qa_result["notes"]
    resume_versions.update(version_id, version.model_dump())

    return {
        "version_id": version_id,
        "title": version.title,
        "txt": version.content_txt,
        "tex": version.content_tex,
        "markdown": version.content_markdown,
        "outputs": {
            "txt": f"/api/data/outputs/{_sanitize_filename(version.title or 'resume')}.txt",
            "tex": f"/api/data/outputs/{_sanitize_filename(version.title or 'resume')}.tex",
            "docx": docx_path,
            "pdf": pdf_path,
        },
        "qa": qa_result,
        "user_approved": version.user_approved,
    }
