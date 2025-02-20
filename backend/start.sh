#!/bin/bash
set -e

# Set up environment
cd /workspace
export PYTHONPATH=/workspace:/workspace/app
export PYTHONUNBUFFERED=1
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./app.db"}
export PORT=${PORT:-8080}

# Install dependencies
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python init_db.py

# Start the application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
