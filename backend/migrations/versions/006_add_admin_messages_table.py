"""Add admin_messages table

Revision ID: 006_add_admin_messages_table
Revises: 005_add_missing_user_fields
Create Date: 2025-01-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_add_admin_messages_table'
down_revision = '005_add_missing_user_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create admin_messages table
    op.create_table(
        'admin_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('receiver_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('is_bulk', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('bulk_campaign_id', sa.String(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_admin_messages_admin_id', 'admin_id'),
        sa.Index('ix_admin_messages_receiver_id', 'receiver_id'),
        sa.Index('ix_admin_messages_bulk_campaign_id', 'bulk_campaign_id'),
    )


def downgrade():
    # Drop admin_messages table
    op.drop_table('admin_messages')