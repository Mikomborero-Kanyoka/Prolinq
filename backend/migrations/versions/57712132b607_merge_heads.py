"""merge_heads

Revision ID: 57712132b607
Revises: 20251127_114800, add_embeddings_fields
Create Date: 2025-11-28 11:21:40.336282

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '57712132b607'
down_revision = ('20251127_114800', 'add_embeddings_fields')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass