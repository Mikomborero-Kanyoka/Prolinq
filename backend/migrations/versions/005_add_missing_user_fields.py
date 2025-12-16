"""Add missing user profile fields

Revision ID: 005_add_missing_user_fields
Revises: 004_add_cover_image
Create Date: 2025-11-20 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_missing_user_fields'
down_revision = '004_add_cover_image'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing profile fields to users table
    op.add_column('users', sa.Column('professional_title', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_email', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_cell', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_address', sa.String(), nullable=True))


def downgrade():
    # Remove columns from users table
    op.drop_column('users', 'company_address')
    op.drop_column('users', 'company_cell')
    op.drop_column('users', 'company_email')
    op.drop_column('users', 'company_name')
    op.drop_column('users', 'location')
    op.drop_column('users', 'professional_title')