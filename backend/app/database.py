from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from . import models

# Get database URL from environment variable or use default PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/musical_memory")

# Create engine with proper dialect
engine = create_engine(SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://"))

# Database initialization moved to FastAPI startup event

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
