#!/bin/bash
set -e

# Set up environment
cd /workspace
export PYTHONPATH=/workspace
export PYTHONUNBUFFERED=1
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./app.db"}
export PORT=${PORT:-8080}

# Run migrations
echo "Running database migrations..."
cd /workspace && alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
cd /workspace && uvicorn app.main:app --host 0.0.0.0 --port $PORT
