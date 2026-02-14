"""Pydantic schemas for Child."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ChildCreate(BaseModel):
    name: str
    birthdate: date
    gender: str | None = None


class ChildUpdate(BaseModel):
    """Only name and gender are editable. Birthdate cannot be changed after creation."""

    name: str | None = None
    gender: str | None = None


class ChildResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    birthdate: date | None
    gender: str | None
    created_at: datetime


class VaccinationTimelineItem(BaseModel):
    """One vaccination in the child timeline (with computed status)."""

    period_label: str
    vaccine_name: str
    due_date: date | None
    completed: bool
    completed_at: datetime | None
    status: str  # "completed" | "due" | "overdue" | "upcoming"
