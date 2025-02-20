#!/bin/bash
set -e

# Function to run migrations
run_migrations() {
    alembic upgrade head
}

# Function to start application
start_app() {
    exec uvicorn app.main:app --host 0.0.0.0 --port 8080
}

# Main execution
run_migrations
start_app
