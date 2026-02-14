"""Cached coverage report (optional, for daily refresh)."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CoverageReport(Base):
    __tablename__ = "coverage_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    payload: Mapped[str] = mapped_column(Text, nullable=False)  # JSON
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
