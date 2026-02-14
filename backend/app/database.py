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


def ensure_sqlite_columns() -> None:
    """Add missing columns to existing SQLite tables (vaccine_templates, child_vaccinations)."""
    if "sqlite" not in DATABASE_URL:
        return
    with engine.connect() as conn:
        # vaccine_templates: add vaccine_group, created_at if missing
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('vaccine_templates') WHERE name = 'vaccine_group'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE vaccine_templates ADD COLUMN vaccine_group TEXT DEFAULT ''"))
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('vaccine_templates') WHERE name = 'created_at'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE vaccine_templates ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP"))
        # child_vaccinations: add vaccine_group, reminder_audio_path if missing
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('child_vaccinations') WHERE name = 'vaccine_group'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE child_vaccinations ADD COLUMN vaccine_group TEXT DEFAULT ''"))
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('child_vaccinations') WHERE name = 'reminder_audio_path'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE child_vaccinations ADD COLUMN reminder_audio_path TEXT"))
        # parents: add preferred_language, is_admin, region_id if missing
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('parents') WHERE name = 'preferred_language'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE parents ADD COLUMN preferred_language TEXT"))
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('parents') WHERE name = 'is_admin'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE parents ADD COLUMN is_admin INTEGER DEFAULT 0"))
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('parents') WHERE name = 'region_id'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE parents ADD COLUMN region_id INTEGER REFERENCES regions(id)"))
        # children: add region_id if missing
        r = conn.execute(
            text("SELECT 1 FROM pragma_table_info('children') WHERE name = 'region_id'")
        )
        if r.fetchone() is None:
            conn.execute(text("ALTER TABLE children ADD COLUMN region_id INTEGER REFERENCES regions(id)"))
        conn.commit()
