"""reconcile job scraped at column

Revision ID: 0005_reconcile_scraped_at
Revises: 1c997fece94d
Create Date: 2026-09-15 00:35:12.104

"""
from alembic import op
import sqlalchemy as sa

revision = '0005_reconcile_scraped_at'
down_revision = '1c997fece94d'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Check if the column already exists before renaming
    conn = op.get_bind()
    has_created = conn.execute(sa.text("SELECT count(*) FROM information_schema.columns WHERE table_name='jobs' and column_name='created_at'")).scalar()
    has_scraped = conn.execute(sa.text("SELECT count(*) FROM information_schema.columns WHERE table_name='jobs' and column_name='scraped_at'")).scalar()

    if has_created and not has_scraped:
        op.alter_column('jobs', 'created_at', new_column_name='scraped_at')
        op.drop_index('ix_jobs_created_at', table_name='jobs')
        op.create_index(op.f('ix_jobs_scraped_at'), 'jobs', ['scraped_at'], unique=False)
    elif not has_scraped:
        op.add_column('jobs', sa.Column('scraped_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
        op.create_index(op.f('ix_jobs_scraped_at'), 'jobs', ['scraped_at'], unique=False)

def downgrade() -> None:
    pass
