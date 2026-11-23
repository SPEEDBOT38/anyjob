"""Resume ingestion — multi-format text extraction with scanned-document detection.

Supports: PDF, DOCX, TXT, LaTeX (.tex). Scanned/image PDFs fall back to OCR
(placeholder; wire pytesseract + tesseract binary when available).
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass
from typing import Optional, Tuple

# Lazy imports so the module imports even if optional deps are missing.


def _pdf_extract(data: bytes) -> Tuple[str, bool]:
    """Extract text from PDF bytes. Returns (text, is_scanned)."""
    try:
        import PyPDF2  # type: ignore
    except Exception:
        return "", True

    reader = PyPDF2.PdfReader(io.BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception:
            parts.append("")
    text = "\n".join(parts).strip()
    # Heuristic: very little text per page suggests scanned/image PDF.
    is_scanned = len(text) < 50 and len(reader.pages) > 0
    return text, is_scanned


def _docx_extract(data: bytes) -> str:
    try:
        import docx2txt  # type: ignore
    except Exception:
        try:
            from docx import Document  # type: ignore

            document = Document(io.BytesIO(data))
            return "\n".join(p.text for p in document.paragraphs if p.text.strip())
        except Exception:
            return ""
    return docx2txt.process(io.BytesIO(data)) or ""


def _tex_extract(data: bytes) -> str:
    text = data.decode("utf-8", errors="replace")
    # Crude LaTeX -> plain text: strip commands, keep content.
    text = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})?", " ", text)
    text = re.sub(r"[{}]", " ", text)
    text = re.sub(r"%[^\n]*", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _txt_extract(data: bytes) -> str:
    return data.decode("utf-8", errors="replace")


@dataclass
class IngestionResult:
    text: str
    format: str  # pdf | docx | txt | tex | image
    is_scanned: bool
    char_count: int
    word_count: int
    confidence: float  # 0..1 — extraction quality estimate
    notes: list[str]


def extract_resume_text(data: bytes, file_format: str) -> IngestionResult:
    """Extract text from resume bytes. file_format: pdf | docx | txt | tex | image."""
    notes: list[str] = []
    fmt = file_format.lower()
    text = ""
    is_scanned = False
    confidence = 1.0

    if fmt == "pdf":
        text, is_scanned = _pdf_extract(data)
        if is_scanned:
            notes.append("PDF appears image-based; OCR recommended for scanned resumes.")
            confidence = 0.3
        elif len(text) < 100:
            notes.append("Very little text extracted from PDF; it may be a scan.")
            confidence = 0.4
    elif fmt == "docx":
        text = _docx_extract(data)
        if not text:
            notes.append("No text extracted from DOCX.")
            confidence = 0.2
    elif fmt == "txt":
        text = _txt_extract(data)
        if not text.strip():
            notes.append("Text file is empty.")
            confidence = 0.1
    elif fmt == "tex":
        text = _tex_extract(data)
    elif fmt == "image":
        is_scanned = True
        notes.append("Image resume uploaded; OCR required.")
        confidence = 0.2
    else:
        raise ValueError(f"Unsupported resume format: {file_format}")

    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    word_count = len(text.split())

    return IngestionResult(
        text=text,
        format=fmt,
        is_scanned=is_scanned,
        char_count=len(text),
        word_count=word_count,
        confidence=confidence,
        notes=notes,
    )


def detect_scanned_pdf(data: bytes) -> bool:
    """Quick heuristic: PDF with extractable text below threshold is likely scanned."""
    text, is_scanned = _pdf_extract(data)
    return is_scanned or len(text.strip()) < 50
