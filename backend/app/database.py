from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import time
from . import models
from .models import Base

# Get database URL from environment variable or use SQLite as fallback
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://")

print(f"Using database URL: {SQLALCHEMY_DATABASE_URL}")

# Create engine with appropriate connection arguments
print(f"Database URL before parsing: {SQLALCHEMY_DATABASE_URL}")
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # For PostgreSQL, ensure URL uses postgresql:// prefix
    db_url = SQLALCHEMY_DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://")
    print(f"Final database URL: {db_url}")
    engine = create_engine(db_url)

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
