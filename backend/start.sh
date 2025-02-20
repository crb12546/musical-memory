#!/bin/bash
set -e

# Set up environment
cd /workspace
export PYTHONPATH=/workspace
export PYTHONUNBUFFERED=1
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./app.db"}
export PORT=${PORT:-8080}

# Initialize database
echo "Initializing database..."
cd /workspace && python init_db.py

# Start the application
echo "Starting FastAPI application..."
cd /workspace && uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
