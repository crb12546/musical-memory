#!/bin/sh
python -m alembic upgrade head
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
