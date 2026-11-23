"""Simple JSON file storage for AnyJob backend entities.

Each entity type is stored in its own JSON file under backend/data/.
This keeps the backend stateless-ish and mirrors the frontend's localStorage model.
"""

from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Type, TypeVar

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

T = TypeVar("T")

_lock = threading.Lock()


def _path(entity: str) -> Path:
    return DATA_DIR / f"{entity}.json"


def _load(entity: str) -> List[Dict[str, Any]]:
    p = _path(entity)
    if not p.exists():
        return []
    try:
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save(entity: str, rows: List[Dict[str, Any]]) -> None:
    with _lock:
        with _path(entity).open("w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2, default=str)


class Store:
    """Tiny CRUD store over JSON files."""

    def __init__(self, entity: str, model: Type[T]):
        self.entity = entity
        self.model = model

    def _rows(self) -> List[Dict[str, Any]]:
        return _load(self.entity)

    def list(self) -> List[T]:
        return [self.model(**r) for r in self._rows()]

    def get(self, id: str) -> Optional[T]:
        for r in self._rows():
            if r.get("id") == id:
                return self.model(**r)
        return None

    def create(self, item: T) -> T:
        rows = self._rows()
        data = item.dict() if hasattr(item, "dict") else item.model_dump()
        rows.append(data)
        _save(self.entity, rows)
        return item

    def update(self, id: str, patch: Dict[str, Any]) -> Optional[T]:
        rows = self._rows()
        for r in rows:
            if r.get("id") == id:
                r.update(patch)
                _save(self.entity, rows)
                return self.model(**r)
        return None

    def delete(self, id: str) -> bool:
        rows = self._rows()
        new_rows = [r for r in rows if r.get("id") != id]
        if len(new_rows) == len(rows):
            return False
        _save(self.entity, new_rows)
        return True

    def query(self, **kwargs) -> List[T]:
        out = []
        for r in self._rows():
            if all(r.get(k) == v for k, v in kwargs.items()):
                out.append(self.model(**r))
        return out


# Entity stores
from .models import (  # noqa: E402
    Application,
    CareerProfile,
    JobPosting,
    MatchAssessment,
    ResumeVersion,
    SearchProfile,
)

profiles = Store("profiles", CareerProfile)
search_profiles = Store("search_profiles", SearchProfile)
job_postings = Store("job_postings", JobPosting)
match_assessments = Store("match_assessments", MatchAssessment)
resume_versions = Store("resume_versions", ResumeVersion)
applications = Store("applications", Application)

__all__ = [
    "profiles",
    "search_profiles",
    "job_postings",
    "match_assessments",
    "resume_versions",
    "applications",
    "Store",
]
