"""Child model."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Child(Base):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    parent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("parents.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    birthdate: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    parent: Mapped["Parent"] = relationship("Parent", back_populates="children")
    vaccinations: Mapped[list["ChildVaccination"]] = relationship(
        "ChildVaccination", back_populates="child"
    )

