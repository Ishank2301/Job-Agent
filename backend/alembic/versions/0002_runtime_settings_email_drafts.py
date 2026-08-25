"""runtime settings and email drafts

Revision ID: 0002_runtime
Revises: 0001_initial
Create Date: 2026-06-17

Adds:
- app_settings table for runtime configuration such as DRY_RUN and daily email cap
- email_drafts table for human-in-the-loop email approval
- email_logs.email_draft_id foreign key for audit traceability
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_runtime"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    email_draft_status = postgresql.ENUM(
        "DRAFT",
        "CONFIRMATION_REQUIRED",
        "APPROVED",
        "SENT",
        "DRY_RUN",
        "FAILED",
        "REJECTED",
        name="emaildraftstatus",
        create_type=False,
    )
    email_draft_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "app_settings",
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column(
            "value",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("key"),
    )

    op.create_table(
        "email_drafts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("to_email", sa.String(length=320), nullable=False),
        sa.Column("subject", sa.String(length=512), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("resume_version_id", sa.String(length=36), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "DRAFT",
                "CONFIRMATION_REQUIRED",
                "APPROVED",
                "SENT",
                "DRY_RUN",
                "FAILED",
                "REJECTED",
                name="emaildraftstatus",
                create_type=False,
            ),
            server_default=sa.text("'DRAFT'::emaildraftstatus"),
            nullable=False,
        ),
        sa.Column(
            "dry_run",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["application_id"],
            ["applications.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["resume_version_id"],
            ["resume_versions.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_email_drafts_application_id",
        "email_drafts",
        ["application_id"],
    )

    op.create_index(
        "ix_email_drafts_status",
        "email_drafts",
        ["status"],
    )

    op.add_column(
        "email_logs",
        sa.Column("email_draft_id", sa.String(length=36), nullable=True),
    )

    op.create_foreign_key(
        "fk_email_logs_email_draft_id",
        "email_logs",
        "email_drafts",
        ["email_draft_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        "ix_email_logs_email_draft_id",
        "email_logs",
        ["email_draft_id"],
    )

    op.execute("""
        INSERT INTO app_settings (key, value)
        VALUES
            ('dry_run', 'true'),
            ('max_emails_per_day', '10')
        ON CONFLICT (key) DO NOTHING
        """)


def downgrade() -> None:
    op.drop_index(
        "ix_email_logs_email_draft_id",
        table_name="email_logs",
    )

    op.drop_constraint(
        "fk_email_logs_email_draft_id",
        "email_logs",
        type_="foreignkey",
    )

    op.drop_column("email_logs", "email_draft_id")

    op.drop_index(
        "ix_email_drafts_status",
        table_name="email_drafts",
    )

    op.drop_index(
        "ix_email_drafts_application_id",
        table_name="email_drafts",
    )

    op.drop_table("email_drafts")

    op.drop_table("app_settings")

    postgresql.ENUM(name="emaildraftstatus").drop(
        op.get_bind(),
        checkfirst=True,
    )
