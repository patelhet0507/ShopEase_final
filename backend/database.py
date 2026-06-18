from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# Use environment variable or default to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shopease.db")

# For production on Render, use PostgreSQL
if "postgresql" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={})
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
