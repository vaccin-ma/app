"""Child vaccination record model (due date, completion, reminders)."""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ChildVaccination(Base):
    __tablename__ = "child_vaccinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    child_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("children.id"), nullable=False
    )
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False)
    vaccine_group: Mapped[str] = mapped_column(String, nullable=False, default="")  # e.g. 'Hépatite B (HB)'
    period_label: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    remindable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    voice_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    child: Mapped["Child"] = relationship("Child", back_populates="vaccinations")
