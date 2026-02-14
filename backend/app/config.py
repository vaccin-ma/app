"""Application configuration using Pydantic BaseSettings.

All settings can be overridden via environment variables (e.g. SECRET_KEY, DATABASE_URL).
Loads from .env file when present.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Security — set SECRET_KEY in production (e.g. export SECRET_KEY=your-secret)
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Database — default SQLite local file; override with DATABASE_URL
    database_url: str = "sqlite:///./vaccines.db"

    # Optional app metadata (can be set via env)
    app_name: str = "Vaccine Reminder API"
    debug: bool = False


settings = Settings()
