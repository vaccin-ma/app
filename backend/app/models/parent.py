"""Parent model."""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String, nullable=True)
    # Preferred language for voice notifications: 'ar' | 'fr' | 'en' (synced from frontend)
    preferred_language: Mapped[str | None] = mapped_column(String, nullable=True)
    # Admin-only access to /admin/* endpoints
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Region (12 Moroccan regions) for immunity monitor; child inherits if not set
    region_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("regions.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    region: Mapped["Region | None"] = relationship("Region", back_populates="parents")
    children: Mapped[list["Child"]] = relationship("Child", back_populates="parent")
