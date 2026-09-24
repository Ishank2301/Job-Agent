"""user profiles for onboarding personalization

Revision ID: 0004_profiles
Revises: 0003_newsletter
Create Date: 2026-09-10

Adds:
- user_profiles table storing onboarding preferences per account email
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0004_profiles"
down_revision = "0003_newsletter"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", postgresql.CITEXT(length=320), nullable=False),
        sa.Column(
            "full_name", sa.String(length=120), nullable=False, server_default=""
        ),
        sa.Column(
            "career_stage", sa.String(length=60), nullable=False, server_default=""
        ),
        sa.Column(
            "target_roles",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "target_locations",
            sa.String(length=255),
            nullable=False,
            server_default="",
        ),
        sa.Column(
            "remote_only", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column(
            "weekly_goal", sa.Integer(), nullable=False, server_default=sa.text("10")
        ),
        sa.Column(
            "onboarded", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_user_profiles_email"),
    )

    op.create_index("ix_user_profiles_email", "user_profiles", ["email"])


def downgrade() -> None:
    op.drop_index("ix_user_profiles_email", table_name="user_profiles")
    op.drop_table("user_profiles")
