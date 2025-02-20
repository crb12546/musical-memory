#!/bin/bash
set -e

# Set up environment
cd /workspace
export PYTHONPATH=/workspace
export PYTHONUNBUFFERED=1

# Run migrations first
python -m alembic upgrade head

# Then start the application
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
