"""Password hashing and JWT utilities. Uses bcrypt directly (no passlib)."""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import settings

# bcrypt has a 72-byte limit; we truncate to avoid ValueError
BCRYPT_MAX_PASSWORD_BYTES = 72


def _to_bcrypt_bytes(password: str) -> bytes:
    """Encode password to bytes and truncate to 72 bytes for bcrypt."""
    encoded = password.encode("utf-8")
    if len(encoded) > BCRYPT_MAX_PASSWORD_BYTES:
        encoded = encoded[:BCRYPT_MAX_PASSWORD_BYTES]
    return encoded


def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt. Passwords longer than 72 bytes are truncated."""
    hashed = bcrypt.hashpw(_to_bcrypt_bytes(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return bcrypt.checkpw(
        _to_bcrypt_bytes(plain_password),
        hashed_password.encode("utf-8"),
    )


def create_access_token(data: dict) -> str:
    """Create a JWT access token from the given payload.

    Uses SECRET_KEY, ALGORITHM, and ACCESS_TOKEN_EXPIRE_MINUTES from config.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode["exp"] = expire
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
