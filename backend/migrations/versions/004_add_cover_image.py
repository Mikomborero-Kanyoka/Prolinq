"""Add cover image to user profiles

Revision ID: 004_add_cover_image
Revises: 003_add_admin_fields
Create Date: 2025-11-20 08:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_cover_image'
down_revision = '003_add_admin_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add cover_image column to users table
    op.add_column('users', sa.Column('cover_image', sa.String(), nullable=True))


def downgrade():
    # Remove cover_image column from users table
    op.drop_column('users', 'cover_image')
