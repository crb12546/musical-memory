#!/bin/bash
set -e

# Set up Python environment
export PYTHONPATH=/workspace

# Run migrations
cd /workspace
python -m alembic upgrade head

# Start the application
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
