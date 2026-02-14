"""Log of Telegram messages sent per region (for idempotency and audit)."""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TelegramLog(Base):
    __tablename__ = "telegram_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    region_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("regions.id"), nullable=False
    )
    vaccine_name: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    status: Mapped[str] = mapped_column(String, nullable=False)  # success | failure
    response_payload: Mapped[str | None] = mapped_column(Text, nullable=True)

    region: Mapped["Region"] = relationship("Region", back_populates="telegram_logs")
