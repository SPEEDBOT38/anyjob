"""AnyJob backend API — FastAPI.

Exposes REST services for the AnyJob SPA:
- Job discovery (JobSpy + Apify)
- Resume ingestion & Master Career Profile
- Explainable matching + evidence-grounded tailoring
- Resume rendering (TXT / LaTeX / PDF / DOCX) + QA
- Application packets + activity log
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .providers import router as provider_router

app = FastAPI(title="AnyJob API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Route modules ----
from .routes_profile import router as profile_router  # noqa: E402
from .routes_discovery import router as discovery_router  # noqa: E402
from .routes_matching import router as matching_router  # noqa: E402
from .routes_tailoring import router as tailoring_router  # noqa: E402
from .routes_rendering import router as rendering_router  # noqa: E402
from .routes_packets import router as packets_router  # noqa: E402
from .routes_activity import router as activity_router  # noqa: E402

app.include_router(profile_router)
app.include_router(provider_router)
app.include_router(discovery_router)
app.include_router(matching_router)
app.include_router(tailoring_router)
app.include_router(rendering_router)
app.include_router(packets_router)
app.include_router(activity_router)


@app.get("/api/health")
async def health():
    return {"ok": True}

app.mount("/", StaticFiles(directory=Path(__file__).resolve().parents[1] / "public", html=True), name="workspace")
