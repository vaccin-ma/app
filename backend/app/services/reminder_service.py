"""Vaccine reminder service: AI text (Minimax), voice (ElevenLabs), store, email, SMS."""
from datetime import date
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import smtplib
from pathlib import Path
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.config import settings
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination


def _media_dir() -> Path:
    """Return absolute path to reminder media directory; create if missing."""
    raw = settings.reminder_media_dir
    if os.path.isabs(raw):
        p = Path(raw)
    else:
        p = Path.cwd() / raw
    p.mkdir(parents=True, exist_ok=True)
    return p


def _generate_reminder_text_minimax(child_name: str, vaccine_name: str, due_date: date) -> str:
    """Generate friendly reminder text in Darija using Minimax LLM."""
    if not settings.minimax_api_key:
        return (
            f"Bghiti tfdker: drari {child_name} khassu yjib {vaccine_name} l-yum ({due_date}). "
            "Nqrawek b had l-wqt. Shokran."
        )
    url = f"{settings.minimax_base_url.rstrip('/')}/v1/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    prompt = (
        f"Generate a short, polite, friendly reminder in Darija (Moroccan Arabic) for a parent "
        f"that their child {child_name} needs the vaccine '{vaccine_name}' today (due date: {due_date}). "
        "One or two sentences only. Do not use English."
    )
    payload: dict[str, Any] = {
        "model": "M2-her",
        "messages": [
            {"role": "system", "content": "You write very short reminders in Darija for parents about child vaccines."},
            {"role": "user", "content": prompt},
        ],
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        choices = data.get("choices") or []
        if choices:
            msg = choices[0].get("message")
            if isinstance(msg, dict):
                content = msg.get("content") or ""
                if isinstance(content, str) and content.strip():
                    return content.strip()
        base = data.get("base_resp") or {}
        if base.get("status_code") not in (0, None):
            raise ValueError(base.get("status_msg") or "Minimax API error")
    except requests.RequestException as e:
        raise RuntimeError(f"Minimax request failed: {e}") from e
    return (
        f"Bghiti tfdker: drari {child_name} khassu yjib {vaccine_name} l-yum ({due_date}). Shokran."
    )


def _generate_voice_elevenlabs(text: str) -> bytes | None:
    """Generate voice from text via ElevenLabs. Returns audio bytes or None if disabled/failed."""
    if not settings.reminder_send_voice or not settings.elevenlabs_api_key:
        return None
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.elevenlabs_voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": settings.elevenlabs_api_key,
    }
    payload = {"text": text}
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.content
    except requests.RequestException:
        return None


def _save_reminder_audio(vaccination_id: int, audio: bytes) -> str:
    """Save audio to media dir, return relative path for DB (e.g. vac_1_20260114.mp3)."""
    root = _media_dir()
    safe_name = f"vac_{vaccination_id}_{date.today().isoformat().replace('-', '')}.mp3"
    file_path = root / safe_name
    file_path.write_bytes(audio)
    return safe_name


def _send_email_with_attachment(
    to_email: str,
    subject: str,
    body_text: str,
    attachment_path: Path | None,
    attachment_filename: str = "reminder.mp3",
) -> bool:
    """Send email via SMTP with optional MP3 attachment. Returns True if sent."""
    if not settings.email_reminders_enabled or not settings.smtp_host or not settings.smtp_user:
        return False
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(body_text, "plain", "utf-8"))
    if attachment_path and attachment_path.exists():
        with open(attachment_path, "rb") as f:
            part = MIMEApplication(f.read(), _subtype="mpeg")
        part.add_header("Content-Disposition", "attachment", filename=attachment_filename)
        msg.attach(part)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(msg["From"], to_email, msg.as_string())
        return True
    except Exception:
        return False


def _send_sms_twilio(to_phone: str | None, text: str) -> bool:
    """Send SMS via Twilio. Returns True if sent."""
    if not settings.twilio_sms_enabled or not to_phone or not settings.twilio_account_sid:
        return False
    try:
        from twilio.rest import Client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=text,
            from_=settings.twilio_phone_number,
            to=to_phone,
        )
        return True
    except Exception:
        return False


def check_and_send_reminders(db: Session) -> list[dict[str, Any]]:
    """
    Fetch all remindable, unsent, due vaccinations; generate text (Minimax), optionally
    voice (ElevenLabs), save audio to disk, send email with attachment and/or SMS,
    mark reminder_sent/voice_sent, return list of sent reminders with audio_url.
    """
    today = date.today()
    media_root = _media_dir()
    q = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            ChildVaccination.completed.is_(False),
            ChildVaccination.remindable.is_(True),
            ChildVaccination.reminder_sent.is_(False),
            ChildVaccination.due_date <= today,
        )
    )
    vaccinations = q.all()
    sent: list[dict[str, Any]] = []

    for vac in vaccinations:
        child = vac.child
        parent = child.parent
        child_name = child.name
        vaccine_name = vac.vaccine_name
        due_date = vac.due_date or today

        # Generate reminder text (Minimax)
        try:
            text = _generate_reminder_text_minimax(child_name, vaccine_name, due_date)
        except Exception:
            text = (
                f"Bghiti tfdker: drari {child_name} khassu yjib {vaccine_name} l-yum ({due_date}). Shokran."
            )

        # Generate voice (ElevenLabs) and store + send
        audio = _generate_voice_elevenlabs(text)
        reminder_audio_path: str | None = None
        if audio is not None:
            vac.voice_sent = True
            reminder_audio_path = _save_reminder_audio(vac.id, audio)
            vac.reminder_audio_path = reminder_audio_path
            full_path = media_root / reminder_audio_path
            if settings.email_reminders_enabled and parent.email:
                subject = f"Rappel vaccin: {vaccine_name} pour {child_name}"
                _send_email_with_attachment(
                    parent.email,
                    subject,
                    text,
                    full_path if full_path.exists() else None,
                    attachment_filename=f"rappel_{vaccine_name}_{child_name}.mp3".replace(" ", "_"),
                )
        else:
            if settings.email_reminders_enabled and parent.email:
                subject = f"Rappel vaccin: {vaccine_name} pour {child_name}"
                _send_email_with_attachment(parent.email, subject, text, None)

        # SMS (text only)
        _send_sms_twilio(parent.phone_number, text)

        vac.reminder_sent = True
        db.commit()

        item: dict[str, Any] = {
            "child_name": child_name,
            "vaccine_name": vaccine_name,
            "due_date": str(due_date),
            "text": text,
        }
        if reminder_audio_path:
            item["reminder_audio_path"] = reminder_audio_path
            item["audio_url"] = f"/reminders/audio/{vac.id}"
        sent.append(item)

    return sent
