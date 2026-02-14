# Telegram: generate message text and send via Bot API; log to TelegramLog
import json
import re
import time
from typing import Literal

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models.region import Region
from app.models.telegram_log import TelegramLog

Language = Literal["fr", "darija"]
TemplateType = Literal["summary", "urgent"]


def generate_telegram_text(
    region_name: str,
    vaccine_name: str,
    vaccine_data: dict,
    language: Language = "fr",
    template_type: TemplateType = "summary",
) -> str:
    """
    Build message text from template. vaccine_data can include:
    coverage_pct, coverage_pct_display, vaccinated_count, total_registered,
    estimated_annual_births, projected_need, current_stock, color.
    """
    cov = vaccine_data.get("coverage_pct_display") or vaccine_data.get("coverage_pct", 0)
    if isinstance(cov, float):
        cov = round(cov * 100, 1)
    vaccinated = vaccine_data.get("vaccinated_count", 0)
    registered = vaccine_data.get("total_registered", 0)
    color = vaccine_data.get("color", "red")

    if template_type == "urgent":
        return (
            f"ALERTE — Région {region_name} : Couverture {cov}% pour {vaccine_name}. "
            "Risque de baisse d'immunité. Veuillez prioriser les campagnes locales. "
            "Contact: admin vaccin.ma"
        )
    # summary
    return (
        f"Bonjour, région {region_name} — Couverture pour {vaccine_name} : {cov}% "
        f"({vaccinated}/{registered}). Objectif : 95%. Couleur : {color}. "
        "Pour plus d'informations, visitez vaccin.ma/admin."
    )


def sanitize_chat_id(chat_id: str | None) -> str | None:
    if not chat_id:
        return None
    s = re.sub(r"[^\d\-]", "", str(chat_id).strip())
    return s if s else None


def send_telegram_message(chat_id: str, text: str) -> dict:
    """Call Telegram Bot API sendMessage. Returns response dict or error."""
    token = (settings.telegram_bot_token or "").strip()
    if not token:
        return {"ok": False, "error": "TELEGRAM_BOT_TOKEN not configured"}
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.post(
                url,
                json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
            )
            data = r.json()
            return data
    except Exception as e:
        return {"ok": False, "error": str(e)}


def send_to_region(
    db: Session,
    region_id: int,
    vaccine_name: str,
    text: str,
    delay_seconds: float = 0.5,
) -> dict:
    """
    Send message to region's telegram_chat_id; log to TelegramLog.
    Returns { "success": bool, "region_id", "response", "logged" }.
    """
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        return {"success": False, "region_id": region_id, "response": {"ok": False, "error": "Region not found"}, "logged": False}
    chat_id = sanitize_chat_id(region.telegram_chat_id)
    if not chat_id:
        return {"success": False, "region_id": region_id, "response": {"ok": False, "error": "telegram_chat_id not set"}, "logged": False}
    time.sleep(delay_seconds)
    response = send_telegram_message(chat_id, text)
    status = "success" if response.get("ok") else "failure"
    db.add(
        TelegramLog(
            region_id=region_id,
            vaccine_name=vaccine_name,
            text=text,
            status=status,
            response_payload=json.dumps(response) if response else None,
        )
    )
    db.commit()
    return {"success": response.get("ok", False), "region_id": region_id, "response": response, "logged": True}
