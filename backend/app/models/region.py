"""Region model (12 Moroccan regions for immunity monitor)."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    population_2024: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_annual_births: Mapped[int] = mapped_column(Integer, nullable=False)
    telegram_chat_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    parents: Mapped[list["Parent"]] = relationship(
        "Parent", back_populates="region"
    )
    children: Mapped[list["Child"]] = relationship(
        "Child", back_populates="region"
    )
    telegram_logs: Mapped[list["TelegramLog"]] = relationship(
        "TelegramLog", back_populates="region"
    )
