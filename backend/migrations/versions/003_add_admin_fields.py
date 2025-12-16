"""Add admin fields to users table

Revision ID: 003
Revises: 002
Create Date: 2025-11-19 11:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_admin_fields'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_admin column
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add is_active column
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade():
    # Remove is_admin column
    op.drop_column('users', 'is_admin')
    
    # Remove is_active column
    op.drop_column('users', 'is_active')
