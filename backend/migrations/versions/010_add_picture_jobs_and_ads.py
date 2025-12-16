"""Add picture-only jobs and ads support

Revision ID: 010_add_picture_jobs_and_ads
Revises: 009_add_advertisements_table
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '010_add_picture_jobs_and_ads'
down_revision = '009_add_advertisements_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns to jobs table
    op.add_column('jobs', sa.Column('is_picture_only', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('jobs', sa.Column('picture_filename', sa.String(), nullable=True))
    
    # Add columns to advertisements table
    op.add_column('advertisements', sa.Column('cta_url', sa.String(), nullable=True))
    op.add_column('advertisements', sa.Column('is_picture_only', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('advertisements', sa.Column('picture_filename', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove columns from advertisements table
    op.drop_column('advertisements', 'picture_filename')
    op.drop_column('advertisements', 'is_picture_only')
    op.drop_column('advertisements', 'cta_url')
    
    # Remove columns from jobs table
    op.drop_column('jobs', 'picture_filename')
    op.drop_column('jobs', 'is_picture_only')