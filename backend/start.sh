#!/bin/bash
set -e

# Set up environment
export PYTHONPATH=/workspace
export PYTHONUNBUFFERED=1
export ALEMBIC_CONFIG=/workspace/alembic.ini

# Run migrations
cd /workspace
alembic upgrade head

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 1
