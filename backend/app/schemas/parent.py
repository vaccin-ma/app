"""Pydantic schemas for Parent."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ParentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=256)
    phone_number: str | None = None


class ParentLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class ParentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone_number: str | None
    preferred_language: str | None
    created_at: datetime


class PreferredLanguageUpdate(BaseModel):
    """Update preferred language for voice notifications (ar, fr, en)."""
    preferred_language: Literal["ar", "fr", "en"]
