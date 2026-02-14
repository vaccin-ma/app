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
    secret_key: str = "ho9na"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Database — default SQLite local file; override with DATABASE_URL
    database_url: str = "sqlite:///./vaccines.db"

    # Optional app metadata (can be set via env)
    app_name: str = "Vaccine Reminder API"
    debug: bool = False

    # Reminder service: Minimax LLM (Arabic Fusha text) — set via .env
    minimax_api_key: str = ""
    minimax_base_url: str = "https://api.minimax.io"
    # Model: MiniMax-M2.5 works with Coding Plan; M2-her is dialogue model (Pay-as-you-go)
    minimax_model: str = "MiniMax-M2.5"

    # Reminder service: ElevenLabs voice (optional) — set via .env
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "oUCSlKjkoFDoKamPHpAV"
    # Per-language voice IDs for notifications (fallback to elevenlabs_voice_id if not set)
    elevenlabs_voice_id_ar: str = ""
    elevenlabs_voice_id_fr: str = ""
    elevenlabs_voice_id_en: str = ""
    reminder_send_voice: bool = True

    # Email (SMTP) — for sending reminder emails with voice attachment
    email_reminders_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    # Twilio — SMS and voice call reminders
    twilio_sms_enabled: bool = False
    twilio_voice_enabled: bool = False
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    # Public URL of this backend (required for Twilio voice: Twilio fetches TwiML from here)
    app_base_url: str = ""

    # Media: directory for storing reminder audio (relative to backend root or absolute)
    reminder_media_dir: str = "media/reminders"

    # Telegram: bot token for admin region notifications (set TELEGRAM_BOT_TOKEN in .env)
    telegram_bot_token: str = ""


settings = Settings()
