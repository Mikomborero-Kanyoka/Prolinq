"""Add resume_images column to users table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add resume_images column to users table for job seekers
    op.add_column('users', sa.Column('resume_images', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove resume_images column
    op.drop_column('users', 'resume_images')