"""SQLAlchemy database configuration (SQLite)."""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

from app.config import settings

# SQLite database file: vaccines.db (override via settings.database_url / .env)
DATABASE_URL = settings.database_url

# SQLAlchemy engine
# check_same_thread=False is required for SQLite when used with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=settings.debug,  # log SQL when debug is True
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session. Closes session after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
