"""Add experience_level and domain to jobs

Revision ID: 1c997fece94d
Revises: 0004_profiles
Create Date: 2026-09-23 09:44:59.113858

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1c997fece94d'
down_revision: Union[str, None] = '0004_profiles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('experience_level', sa.String(length=50), nullable=True))
    op.add_column('jobs', sa.Column('domain', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_jobs_experience_level'), 'jobs', ['experience_level'], unique=False)
    op.create_index(op.f('ix_jobs_domain'), 'jobs', ['domain'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_jobs_domain'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_experience_level'), table_name='jobs')
    op.drop_column('jobs', 'domain')
    op.drop_column('jobs', 'experience_level')
