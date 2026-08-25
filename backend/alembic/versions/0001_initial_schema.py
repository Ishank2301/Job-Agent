"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-17
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    application_status = postgresql.ENUM(
        "SAVED",
        "APPLIED",
        "ASSESSMENT",
        "INTERVIEW",
        "OFFER",
        "REJECTED",
        name="applicationstatus",
        create_type=False,
    )
    application_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "jobs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("external_id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("url", postgresql.CITEXT(length=2048), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("salary", sa.String(length=100), nullable=True),
        sa.Column(
            "skills",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
        sa.Column("date_posted", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("external_id", name="uq_jobs_external_id"),
        sa.UniqueConstraint("url", name="uq_jobs_url"),
    )

    op.create_index("ix_jobs_external_id", "jobs", ["external_id"])
    op.create_index("ix_jobs_created_at", "jobs", ["created_at"])

    op.create_table(
        "recruiters",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("linkedin_url", sa.String(length=2048), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_recruiters_company", "recruiters", ["company"])
    op.create_index("ix_recruiters_email", "recruiters", ["email"])

    op.create_table(
        "applications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("job_id", sa.String(length=36), nullable=False),
        sa.Column("recruiter_id", sa.String(length=36), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "SAVED",
                "APPLIED",
                "ASSESSMENT",
                "INTERVIEW",
                "OFFER",
                "REJECTED",
                name="applicationstatus",
                create_type=False,
            ),
            server_default=sa.text("'SAVED'::applicationstatus"),
            nullable=False,
        ),
        sa.Column("ats_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["recruiter_id"], ["recruiters.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", name="uq_applications_job_id"),
    )

    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_recruiter_id", "applications", ["recruiter_id"])
    op.create_index("ix_applications_status", "applications", ["status"])
    op.create_index("ix_applications_created_at", "applications", ["created_at"])

    op.create_table(
        "resumes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("template_id", sa.String(length=100), nullable=False),
        sa.Column(
            "base_resume",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "tailored_resume",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["application_id"], ["applications.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_resumes_application_id", "resumes", ["application_id"])

    op.create_table(
        "resume_versions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("resume_id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column(
            "content",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("ats_score", sa.Float(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "resume_id", "version", name="uq_resume_versions_resume_version"
        ),
    )

    op.create_index("ix_resume_versions_resume_id", "resume_versions", ["resume_id"])

    op.create_table(
        "email_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=True),
        sa.Column("to_email", sa.String(length=320), nullable=False),
        sa.Column("subject", sa.String(length=512), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "dry_run", sa.Boolean(), server_default=sa.text("false"), nullable=False
        ),
        sa.Column(
            "sent_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["application_id"], ["applications.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_email_logs_application_id", "email_logs", ["application_id"])
    op.create_index("ix_email_logs_status", "email_logs", ["status"])
    op.create_index("ix_email_logs_sent_at", "email_logs", ["sent_at"])

    op.create_table(
        "autofill_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=True),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("provider", sa.String(length=20), nullable=False),
        sa.Column(
            "status", sa.String(length=30), server_default="PENDING", nullable=False
        ),
        sa.Column(
            "profile_data",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("resume_path", sa.String(length=1024), nullable=True),
        sa.Column("screenshot_path", sa.String(length=1024), nullable=True),
        sa.Column("confirmation_url", sa.String(length=2048), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["application_id"], ["applications.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_autofill_sessions_application_id", "autofill_sessions", ["application_id"]
    )
    op.create_index("ix_autofill_sessions_status", "autofill_sessions", ["status"])


def downgrade() -> None:
    op.drop_index("ix_autofill_sessions_status", table_name="autofill_sessions")
    op.drop_index("ix_autofill_sessions_application_id", table_name="autofill_sessions")
    op.drop_table("autofill_sessions")

    op.drop_index("ix_email_logs_sent_at", table_name="email_logs")
    op.drop_index("ix_email_logs_status", table_name="email_logs")
    op.drop_index("ix_email_logs_application_id", table_name="email_logs")
    op.drop_table("email_logs")

    op.drop_index("ix_resume_versions_resume_id", table_name="resume_versions")
    op.drop_table("resume_versions")

    op.drop_index("ix_resumes_application_id", table_name="resumes")
    op.drop_table("resumes")

    op.drop_index("ix_applications_created_at", table_name="applications")
    op.drop_index("ix_applications_status", table_name="applications")
    op.drop_index("ix_applications_recruiter_id", table_name="applications")
    op.drop_index("ix_applications_job_id", table_name="applications")
    op.drop_table("applications")

    op.drop_index("ix_recruiters_email", table_name="recruiters")
    op.drop_index("ix_recruiters_company", table_name="recruiters")
    op.drop_table("recruiters")

    op.drop_index("ix_jobs_created_at", table_name="jobs")
    op.drop_index("ix_jobs_external_id", table_name="jobs")
    op.drop_table("jobs")

    postgresql.ENUM(name="applicationstatus").drop(op.get_bind(), checkfirst=True)

    op.execute("DROP EXTENSION IF EXISTS citext")
