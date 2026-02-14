"""National vaccine stock (current stock per vaccine)."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class NationalStock(Base):
    __tablename__ = "national_stock"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    current_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
