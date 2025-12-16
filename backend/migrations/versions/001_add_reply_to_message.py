"""Add reply_to_id column to messages table

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add reply_to_id column to messages table
    op.add_column('messages', sa.Column('reply_to_id', sa.Integer(), nullable=True))
    # Create foreign key constraint
    op.create_foreign_key('fk_messages_reply_to_id', 'messages', 'messages', ['reply_to_id'], ['id'])


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint('fk_messages_reply_to_id', 'messages', type_='foreignkey')
    # Remove reply_to_id column
    op.drop_column('messages', 'reply_to_id')