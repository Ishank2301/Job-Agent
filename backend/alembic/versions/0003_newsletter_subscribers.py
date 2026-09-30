"""newsletter subscribers

Revision ID: 0003_newsletter
Revises: 0002_runtime
Create Date: 2026-09-09

Adds:
- newsletter_subscribers table for website email opt-ins (idempotent by email)
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0003_newsletter"
down_revision = "0002_runtime"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "newsletter_subscribers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column(
            "email",
            postgresql.CITEXT(length=320),
            nullable=False,
        ),
        sa.Column(
            "source",
            sa.String(length=50),
            server_default=sa.text("'web'"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_newsletter_subscribers_email"),
    )

    op.create_index(
        "ix_newsletter_subscribers_email",
        "newsletter_subscribers",
        ["email"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_newsletter_subscribers_email",
        table_name="newsletter_subscribers",
    )
    op.drop_table("newsletter_subscribers")
