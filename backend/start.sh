#!/bin/bash
set -e

# Set environment variables
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./app.db"}

# Initialize database
echo "Initializing database..."
python init_db.py

# Start the application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
