"""Vaccine reminder service: AI text (Minimax), voice (ElevenLabs), store, email, SMS."""
import logging
from datetime import date, timedelta

# Month names in English for AI-readable date in prompts (e.g. "23 March 2023")
_MONTH_NAMES = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)


def _format_date_readable(d: date) -> str:
    """Format date for AI prompts, e.g. '23 March 2023' (readable, unambiguous)."""
    return f"{d.day} {_MONTH_NAMES[d.month - 1]} {d.year}"


logger = logging.getLogger(__name__)
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


# Fallback reminder texts per language (when Minimax is unavailable or fails)
_FALLBACK_REMINDERS = {
    "ar": "تذكير: يحتاج طفلك {child_name} إلى لقاح {vaccine_name} اليوم (تاريخ الاستحقاق: {due_date_str}). نقدر لكم حرصكم. شكراً.",
    "fr": "Rappel : votre enfant {child_name} doit recevoir le vaccin {vaccine_name} aujourd'hui (date prévue : {due_date_str}). Merci.",
    "en": "Reminder: your child {child_name} is due for the {vaccine_name} vaccine today (due date: {due_date_str}). Thank you.",
}


def _generate_reminder_text_minimax(
    lang: str, child_name: str, vaccine_name: str, due_date: date
) -> str:
    """Generate friendly reminder text in the given language (ar/fr/en) using Minimax LLM."""
    due_date_str = _format_date_readable(due_date)
    lang = lang if lang in ("ar", "fr", "en") else "fr"
    fallback = _FALLBACK_REMINDERS.get(lang, _FALLBACK_REMINDERS["fr"]).format(
        child_name=child_name, vaccine_name=vaccine_name, due_date_str=due_date_str
    )
    if not settings.minimax_api_key:
        return fallback
    url = f"{settings.minimax_base_url.rstrip('/')}/v1/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    if lang == "ar":
        prompt = (
            f"Generate a short, polite reminder in Arabic Fusha (الفصحى) for a parent "
            f"that their child {child_name} needs the vaccine '{vaccine_name}' today (due date: {due_date_str}). "
            "One or two sentences only. Use only Modern Standard Arabic."
        )
        system = "You write very short reminders in Arabic Fusha for parents about child vaccines."
    elif lang == "fr":
        prompt = (
            f"Génère un court rappel poli en français pour un parent : son enfant {child_name} "
            f"doit recevoir le vaccin '{vaccine_name}' aujourd'hui (date prévue : {due_date_str}). "
            "Une ou deux phrases seulement. En français uniquement."
        )
        system = "Tu écris de très courts rappels en français pour les parents concernant les vaccins des enfants."
    else:
        prompt = (
            f"Generate a short, polite reminder in English for a parent "
            f"that their child {child_name} needs the vaccine '{vaccine_name}' today (due date: {due_date_str}). "
            "One or two sentences only. Use only English."
        )
        system = "You write very short reminders in English for parents about child vaccines."
    payload: dict[str, Any] = {
        "model": settings.minimax_model,
        "messages": [
            {"role": "system", "name": "MiniMax AI", "content": system},
            {"role": "user", "name": "User", "content": prompt},
        ],
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        base = data.get("base_resp") or {}
        status_code = base.get("status_code")
        if status_code not in (0, None):
            logger.warning("Minimax API returned status_code=%s. Using fallback text.", status_code)
            return fallback
        choices = data.get("choices") or []
        if choices:
            msg = choices[0].get("message")
            if isinstance(msg, dict):
                content = msg.get("content") or ""
                if isinstance(content, str) and content.strip():
                    return content.strip()
        return fallback
    except requests.RequestException as e:
        logger.warning("Minimax request failed: %s. Using fallback text.", e)
        return fallback
    except Exception as e:
        logger.warning("Minimax unexpected error: %s. Using fallback text.", e)
        return fallback


def _get_voice_id_for_lang(lang: str) -> str:
    """Return ElevenLabs voice ID for the given language (ar/fr/en). Falls back to default if not set."""
    lang = lang if lang in ("ar", "fr", "en") else "fr"
    vid = getattr(settings, f"elevenlabs_voice_id_{lang}", None) or ""
    if vid:
        return vid
    return settings.elevenlabs_voice_id


def _generate_voice_elevenlabs(text: str, lang: str = "fr") -> bytes | None:
    """Generate voice from text via ElevenLabs using the voice ID for the given language. Returns audio bytes or None."""
    if not settings.reminder_send_voice or not settings.elevenlabs_api_key:
        return None
    voice_id = _get_voice_id_for_lang(lang)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
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


# Vaccinations due within this many days before today (or today) are remindable
REMINDABLE_DAYS = 7


def _process_reminders_for_vaccinations(
    db: Session,
    vaccinations: list[ChildVaccination],
    media_root: Path,
) -> list[dict[str, Any]]:
    """Generate text, voice, save audio, send email/SMS, mark reminder_sent for each vaccination. Returns list of sent items."""
    today = date.today()
    sent: list[dict[str, Any]] = []
    for vac in vaccinations:
        child = vac.child
        parent = child.parent
        child_name = child.name
        vaccine_name = vac.vaccine_name
        due_date = vac.due_date or today
        lang = (parent.preferred_language or "fr").strip().lower() or "fr"
        if lang not in ("ar", "fr", "en"):
            lang = "fr"

        try:
            text = _generate_reminder_text_minimax(lang, child_name, vaccine_name, due_date)
        except Exception:
            text = _FALLBACK_REMINDERS.get(lang, _FALLBACK_REMINDERS["fr"]).format(
                child_name=child_name,
                vaccine_name=vaccine_name,
                due_date_str=_format_date_readable(due_date),
            )

        audio = _generate_voice_elevenlabs(text, lang)
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


def check_and_send_reminders(db: Session) -> list[dict[str, Any]]:
    """
    Fetch all remindable, unsent, due vaccinations; generate text (Minimax), optionally
    voice (ElevenLabs), save audio to disk, send email with attachment and/or SMS,
    mark reminder_sent/voice_sent, return list of sent reminders with audio_url.
    Only includes vaccinations whose due_date is in [today - REMINDABLE_DAYS, today].
    """
    today = date.today()
    cutoff = today - timedelta(days=REMINDABLE_DAYS)
    media_root = _media_dir()
    q = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            ChildVaccination.completed.is_(False),
            ChildVaccination.reminder_sent.is_(False),
            ChildVaccination.due_date.isnot(None),
            ChildVaccination.due_date <= today,
            ChildVaccination.due_date >= cutoff,
        )
    )
    vaccinations = q.all()
    return _process_reminders_for_vaccinations(db, vaccinations, media_root)


def check_and_send_reminders_for_child(db: Session, child_id: int) -> list[dict[str, Any]]:
    """
    Generate and send reminders (including voice) for a single child's due/overdue vaccinations.
    Call this right after adding a child so that any vaccines already due get their voice created immediately.
    """
    today = date.today()
    cutoff = today - timedelta(days=REMINDABLE_DAYS)
    media_root = _media_dir()
    q = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            Child.id == child_id,
            ChildVaccination.completed.is_(False),
            ChildVaccination.reminder_sent.is_(False),
            ChildVaccination.due_date.isnot(None),
            ChildVaccination.due_date <= today,
            ChildVaccination.due_date >= cutoff,
        )
    )
    vaccinations = q.all()
    return _process_reminders_for_vaccinations(db, vaccinations, media_root)
