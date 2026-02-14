"""SQLAlchemy database configuration (SQLite)."""
from collections.abc import Generator

from sqlalchemy import create_engine, text
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


def ensure_reminder_audio_column() -> None:
    """Add reminder_audio_path column to child_vaccinations if missing (SQLite)."""
    if "sqlite" not in DATABASE_URL:
        return
    with engine.connect() as conn:
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('child_vaccinations') WHERE name = 'reminder_audio_path'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE child_vaccinations ADD COLUMN reminder_audio_path TEXT"))
        conn.commit()
