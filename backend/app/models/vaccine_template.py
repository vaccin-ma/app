"""Vaccine template model (schedule reference, e.g. Week 6, Month 2)."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class VaccineTemplate(Base):
    __tablename__ = "vaccine_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    period_label: Mapped[str] = mapped_column(String, nullable=False)  # e.g. 'Week 6', 'Month 2'
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False)
    offset_days: Mapped[int] = mapped_column(Integer, nullable=False)  # days after birth
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
