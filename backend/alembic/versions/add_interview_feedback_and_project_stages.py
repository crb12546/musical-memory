"""add interview feedback and project stages

Revision ID: add_interview_feedback_and_project_stages
Revises: 
Create Date: 2025-02-17 17:23:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_interview_feedback_and_project_stages'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to interviews table
    op.add_column('interviews', sa.Column('interview_type', sa.String(), nullable=True))
    op.add_column('interviews', sa.Column('technical_score', sa.Integer(), nullable=True))
    op.add_column('interviews', sa.Column('communication_score', sa.Integer(), nullable=True))
    op.add_column('interviews', sa.Column('culture_fit_score', sa.Integer(), nullable=True))
    op.add_column('interviews', sa.Column('overall_rating', sa.Float(), nullable=True))
    op.add_column('interviews', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Add new columns to projects table
    op.add_column('projects', sa.Column('current_stage', sa.String(), nullable=True))
    # Store completed stages as JSON string in SQLite
    op.add_column('projects', sa.Column('completed_stages', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Add new columns to resumes table
    op.add_column('resumes', sa.Column('updated_at', sa.DateTime(), nullable=True))

def downgrade():
    # Remove columns from interviews table
    op.drop_column('interviews', 'interview_type')
    op.drop_column('interviews', 'technical_score')
    op.drop_column('interviews', 'communication_score')
    op.drop_column('interviews', 'culture_fit_score')
    op.drop_column('interviews', 'overall_rating')
    op.drop_column('interviews', 'updated_at')

    # Remove columns from projects table
    op.drop_column('projects', 'current_stage')
    op.drop_column('projects', 'completed_stages')
    op.drop_column('projects', 'updated_at')

    # Remove columns from resumes table
    op.drop_column('resumes', 'updated_at')
