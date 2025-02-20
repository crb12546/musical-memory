from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import time
from . import models
from .models import Base

# Get database URL from environment variable or use SQLite as fallback
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")
print(f"Initial database URL: {SQLALCHEMY_DATABASE_URL}")

# Parse database URL components
from urllib.parse import urlparse
parsed_url = urlparse(SQLALCHEMY_DATABASE_URL)
is_postgres = parsed_url.scheme in ('postgres', 'postgresql')

if is_postgres:
    # Ensure postgresql:// prefix and proper connection settings
    db_url = SQLALCHEMY_DATABASE_URL.replace('postgres://', 'postgresql://')
    print(f"Using PostgreSQL URL: {db_url}")
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )
else:
    print(f"Using SQLite URL: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Create all tables at startup
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    retries = 3
    while retries > 0:
        try:
            db = SessionLocal()
            yield db
        except Exception as e:
            retries -= 1
            if retries == 0:
                raise
            time.sleep(1)
        finally:
            db.close()
