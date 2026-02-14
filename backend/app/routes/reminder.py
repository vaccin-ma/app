"""Reminder routes: manual trigger for sending vaccine reminders + serve audio."""
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.child_vaccination import ChildVaccination
from app.services.reminder_service import check_and_send_reminders, _media_dir

router = APIRouter()


@router.get("/send")
def send_reminders(db: Session = Depends(get_db)) -> dict:
    """
    Manually trigger reminder check and send. For testing or cron.
    Returns list of reminders sent: child_name, vaccine_name, due_date, text, audio_url (if voice generated).
    """
    sent = check_and_send_reminders(db)
    return {"reminders_sent": len(sent), "reminders": sent}


@router.get("/audio/{vaccination_id}")
def get_reminder_audio(vaccination_id: int, db: Session = Depends(get_db)):
    """Serve the stored reminder MP3 for a vaccination (for playback or Twilio voice)."""
    vac = db.query(ChildVaccination).filter(ChildVaccination.id == vaccination_id).first()
    if not vac or not vac.reminder_audio_path:
        raise HTTPException(status_code=404, detail="Reminder audio not found")
    root = _media_dir()
    file_path = root / vac.reminder_audio_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        filename=Path(vac.reminder_audio_path).name,
    )
