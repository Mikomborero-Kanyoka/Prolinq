"""Add bulk_campaign_name and is_deleted_by_user to admin_messages

Revision ID: 008_add_campaign_name_and_delete_flag
Revises: 006_add_admin_messages_table
Create Date: 2025-01-16 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008_add_campaign_name_and_delete_flag'
down_revision = '006_add_admin_messages_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to admin_messages table
    op.add_column('admin_messages', sa.Column('bulk_campaign_name', sa.String(), nullable=True))
    op.add_column('admin_messages', sa.Column('is_deleted_by_user', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove the columns in reverse order
    op.drop_column('admin_messages', 'is_deleted_by_user')
    op.drop_column('admin_messages', 'bulk_campaign_name')