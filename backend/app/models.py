import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import CITEXT, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text

from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class ApplicationStatus(str, PyEnum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    ASSESSMENT = "ASSESSMENT"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class EmailDraftStatus(str, PyEnum):
    DRAFT = "DRAFT"
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED"
    APPROVED = "APPROVED"
    SENT = "SENT"
    DRY_RUN = "DRY_RUN"
    FAILED = "FAILED"
    REJECTED = "REJECTED"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    external_id: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    url: Mapped[str] = mapped_column(CITEXT(2048), nullable=False, unique=True)

    source: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    salary: Mapped[str | None] = mapped_column(String(100), nullable=True)
    skills: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    date_posted: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        index=True,
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
    )


class Recruiter(Base):
    __tablename__ = "recruiters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True, index=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="recruiter",
    )


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("job_id", name="uq_applications_job_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    job_id: Mapped[str] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )

    recruiter_id: Mapped[str | None] = mapped_column(
        ForeignKey("recruiters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(
            ApplicationStatus,
            name="applicationstatus",
            values_callable=lambda x: [member.value for member in x],
        ),
        nullable=False,
        default=ApplicationStatus.SAVED,
        server_default=text("'SAVED'::applicationstatus"),
        index=True,
    )

    ats_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        onupdate=datetime.utcnow,
    )

    job: Mapped["Job"] = relationship(back_populates="applications")
    recruiter: Mapped["Recruiter | None"] = relationship(back_populates="applications")

    resumes: Mapped[list["Resume"]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
    )

    email_drafts: Mapped[list["EmailDraft"]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
    )


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    application_id: Mapped[str] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    template_id: Mapped[str] = mapped_column(
        String(100), nullable=False, default="default"
    )

    base_resume: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    tailored_resume: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    application: Mapped["Application"] = relationship(back_populates="resumes")

    versions: Mapped[list["ResumeVersion"]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
    )


class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    __table_args__ = (
        UniqueConstraint(
            "resume_id", "version", name="uq_resume_versions_resume_version"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    resume_id: Mapped[str] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    content: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    ats_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    resume: Mapped["Resume"] = relationship(back_populates="versions")


class EmailDraft(Base):
    __tablename__ = "email_drafts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    application_id: Mapped[str] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    to_email: Mapped[str] = mapped_column(String(320), nullable=False)
    subject: Mapped[str] = mapped_column(String(512), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    resume_version_id: Mapped[str | None] = mapped_column(
        ForeignKey("resume_versions.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[EmailDraftStatus] = mapped_column(
        Enum(
            EmailDraftStatus,
            name="emaildraftstatus",
            values_callable=lambda x: [member.value for member in x],
        ),
        nullable=False,
        default=EmailDraftStatus.DRAFT,
        server_default=text("'DRAFT'::emaildraftstatus"),
        index=True,
    )

    dry_run: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    application: Mapped["Application"] = relationship(back_populates="email_drafts")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    email_draft_id: Mapped[str | None] = mapped_column(
        ForeignKey("email_drafts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    application_id: Mapped[str | None] = mapped_column(
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    to_email: Mapped[str] = mapped_column(String(320), nullable=False)
    subject: Mapped[str] = mapped_column(String(512), nullable=False)

    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    dry_run: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    sent_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        index=True,
    )


class AppSetting(Base):
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[dict | list | str | int | float | bool] = mapped_column(
        JSONB, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        onupdate=datetime.utcnow,
    )


class AutofillSession(Base):
    __tablename__ = "autofill_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    application_id: Mapped[str | None] = mapped_column(
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)

    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="PENDING", index=True
    )

    profile_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    resume_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    screenshot_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    confirmation_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
        onupdate=datetime.utcnow,
    )
