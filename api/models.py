"""AnyJob shared data model — canonical objects consumed by all services.

Entities:
  CareerProfile      - verified, structured career history + evidence
  SearchProfile      - user's job-search preferences & autonomy settings
  JobPosting         - canonical job snapshot (source-backed, deduplicated)
  MatchAssessment    - eligibility + relevance + missing evidence
  ResumeVersion      - tailored resume content + output files + QA results
  Application        - application packet linking job -> resume version -> status
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, HttpUrl, validator


class ResumeType(str, Enum):
    CHRONOLOGICAL = "chronological"
    FUNCTIONAL = "functional"
    COMBINATION = "combination"
    TARGETED = "targeted"


class JobCategory(str, Enum):
    TECHNOLOGY = "technology"
    BUSINESS = "business"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    CREATIVE = "creative"
    ENGINEERING = "engineering"


class WorkArrangement(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    ANY = "any"


class ApplicationStatus(str, Enum):
    DISCOVERED = "discovered"
    MATCHED = "matched"
    PREPARED = "prepared"
    READY_FOR_REVIEW = "ready_for_review"
    SUBMITTED = "submitted"
    INTERVIEW = "interview"
    OFFER = "offer"
    CLOSED = "closed"
    ARCHIVED = "archived"


class AIProvider(str, Enum):
    KILOCODE = "kilocode"
    GEMINI = "gemini"


class ExperienceEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = ""
    org: str = ""
    dates: str = ""
    location: str = ""
    bullets: List[str] = Field(default_factory=list)
    skills_used: List[str] = Field(default_factory=list)
    verified: bool = True


class EducationEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    degree: str = ""
    institution: str = ""
    dates: str = ""
    field_of_study: str = ""
    verified: bool = True


class SkillEntry(BaseModel):
    name: str
    level: str = "proficient"  # beginner | proficient | expert
    years_of_experience: Optional[float] = None
    verified: bool = True


class ProjectEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = ""
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = None
    verified: bool = True


class CertificationEntry(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""
    verified: bool = True


class CareerProfile(BaseModel):
    """Verified, structured career history — the single source of truth."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Personal
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    headline: str = ""
    summary: str = ""
    work_authorization: Optional[str] = None

    # Structured history
    experience: List[ExperienceEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list)
    skills: List[SkillEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    certifications: List[CertificationEntry] = Field(default_factory=list)

    # Source tracking
    source_resume_text: Optional[str] = None
    source_resume_format: Optional[str] = None  # pdf | docx | txt | latex | image
    parsing_confidence: Optional[float] = None
    needs_review: bool = True

    class Config:
        use_enum_values = True


class SearchProfile(BaseModel):
    """User's job-search preferences and autonomy settings."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    target_roles: List[str] = Field(default_factory=list)
    target_categories: List[JobCategory] = Field(default_factory=list)
    target_subroles: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    work_arrangement: WorkArrangement = WorkArrangement.ANY
    seniority_levels: List[str] = Field(default_factory=list)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    industries: List[str] = Field(default_factory=list)
    excluded_companies: List[str] = Field(default_factory=list)
    excluded_roles: List[str] = Field(default_factory=list)

    # Autonomy level (blueprint: Discover..Submit)
    autonomy_level: int = 3  # 1=discover, 2=prepare, 3=package, 4=assist, 5=submit
    auto_submit_enabled: bool = False
    require_approval_before_apply: bool = True

    # AI settings
    ai_provider: AIProvider = AIProvider.KILOCODE
    kilocode_api_key: Optional[str] = None
    kilocode_endpoint: Optional[str] = None
    kilocode_model: str = "kilocode"
    gemini_api_key: Optional[str] = None

    # Template / output
    default_resume_type: ResumeType = ResumeType.CHRONOLOGICAL
    default_page_size: str = "a4"
    default_output_formats: List[str] = Field(default_factory=lambda: ["txt", "tex", "pdf"])

    class Config:
        use_enum_values = True


class JobRequirement(BaseModel):
    text: str
    importance: str  # must | nice
    matched: bool = False
    evidence: Optional[str] = None  # quote from career profile
    confidence: float = 0.0


class JobPosting(BaseModel):
    """Canonical, source-backed job snapshot."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Core
    external_id: Optional[str] = None  # source-specific id
    source: str = ""  # jobspy | apify | user_url | user_paste
    source_url: Optional[str] = None
    title: str = ""
    company: str = ""
    location: str = ""
    work_arrangement: WorkArrangement = WorkArrangement.ANY
    employment_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_interval: Optional[str] = None
    posted_date: Optional[str] = None

    # Content
    description: str = ""
    requirements_raw: str = ""
    category: Optional[JobCategory] = None
    subrole: Optional[str] = None

    # Normalized / deduplicated
    is_duplicate_of: Optional[str] = None
    is_active: bool = True
    extraction_quality: float = 1.0  # 0..1

    # Parsed requirements (populated by JD analysis)
    requirements: List[JobRequirement] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    nice_to_have_skills: List[str] = Field(default_factory=list)

    class Config:
        use_enum_values = True


class MatchAssessment(BaseModel):
    """Eligibility + relevance judgment with explanation."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    job_id: str
    profile_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Eligibility (hard constraints)
    eligible: bool = True
    eligibility_notes: List[str] = Field(default_factory=list)
    missing_hard_requirements: List[str] = Field(default_factory=list)

    # Relevance (soft scoring / 100)
    relevance_score: int = 0
    skills_match_pct: float = 0.0
    experience_match_pct: float = 0.0
    role_alignment_pct: float = 0.0
    preference_match_pct: float = 0.0

    # Evidence
    matched_requirements: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)  # JD reqs not in profile
    explanation: str = ""
    confidence: float = 0.0

    # Verdict
    verdict: str = ""  # apply | partial | skip
    recommended_action: str = ""

    class Config:
        use_enum_values = True


class ResumeVersion(BaseModel):
    """Tailored resume content + output files + QA results."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    job_id: str
    profile_id: str
    match_id: Optional[str] = None

    resume_type: ResumeType = ResumeType.CHRONOLOGICAL
    template: str = "classic"
    page_size: str = "a4"

    # Content
    title: str = ""
    content_txt: str = ""
    content_tex: str = ""
    content_markdown: str = ""

    # Output files
    output_txt: Optional[str] = None  # path/url
    output_tex: Optional[str] = None
    output_pdf: Optional[str] = None
    output_docx: Optional[str] = None

    # QA
    qa_passed: bool = False
    qa_checks: Dict[str, bool] = Field(default_factory=dict)
    qa_notes: List[str] = Field(default_factory=list)

    # Provenance
    ai_provider_used: AIProvider = AIProvider.KILOCODE
    user_approved: bool = False
    approved_at: Optional[datetime] = None

    class Config:
        use_enum_values = True


class Application(BaseModel):
    """Application packet linking job -> resume version -> status."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    job_id: str
    resume_version_id: Optional[str] = None
    match_id: Optional[str] = None

    status: ApplicationStatus = ApplicationStatus.DISCOVERED
    application_url: Optional[str] = None
    applied_at: Optional[datetime] = None
    cover_letter: Optional[str] = None

    # Timeline
    events: List[Dict[str, Any]] = Field(default_factory=list)

    # Notes
    user_notes: str = ""
    recruiter_contact: Optional[str] = None
    interview_date: Optional[str] = None
    outcome: Optional[str] = None

    class Config:
        use_enum_values = True


# ---------- Request / Response models for API ----------

class ResumeUploadRequest(BaseModel):
    profile_id: Optional[str] = None
    file_format: str  # pdf | docx | txt | latex | image


class JobSearchRequest(BaseModel):
    query: str
    location: str = ""
    sites: str = "linkedin,indeed,zip_recruiter,glassdoor"
    results_wanted: int = 20
    hours_old: int = 72
    country_indeed: str = "USA"
    fetch_description: bool = True


class MatchRequest(BaseModel):
    job_id: str
    profile_id: str


class TailorRequest(BaseModel):
    job_id: str
    profile_id: str
    resume_type: ResumeType = ResumeType.CHRONOLOGICAL
    template: str = "classic"
    generation_mode: str = "balanced"  # conservative | balanced | comprehensive


class ApplicationCreateRequest(BaseModel):
    job_id: str
    resume_version_id: str
    cover_letter: Optional[str] = None
