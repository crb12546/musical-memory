from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from . import models

# Get database URL from environment variable or use SQLite as fallback
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Create engine with appropriate connection arguments
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # For PostgreSQL, replace postgres:// with postgresql:// in URL if needed
    engine = create_engine(SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://"))

# Create all tables at startup
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
