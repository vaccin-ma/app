"""Notifications: list voice reminders for the current user (where to find the voice message)."""
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.parent import Parent
from app.utils.dependencies import get_current_user

router = APIRouter()


def _media_dir() -> Path:
    """Reminder media directory (same as in reminder_service)."""
    raw = settings.reminder_media_dir
    if os.path.isabs(raw):
        return Path(raw)
    return Path.cwd() / raw


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """
    List voice reminders for the current user's children.
    Each item tells the user where to find the voice message (audio_url) and which child/vaccine it is.
    """
    q = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            Child.parent_id == current_user.id,
            ChildVaccination.reminder_audio_path.isnot(None),
        )
        .order_by(ChildVaccination.id.desc())
        .limit(50)
    )
    rows = q.all()
    return [
        {
            "id": vac.id,
            "child_id": vac.child_id,
            "child_name": vac.child.name,
            "vaccine_name": vac.vaccine_name,
            "period_label": vac.period_label,
            "due_date": str(vac.due_date) if vac.due_date else None,
            "audio_url": f"/reminders/audio/{vac.id}",
        }
        for vac in rows
    ]


@router.delete("/{vaccination_id}", status_code=204)
def delete_notification(
    vaccination_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """
    Delete a voice reminder notification and its audio file.
    The vaccination must belong to one of the current user's children.
    """
    vac = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            ChildVaccination.id == vaccination_id,
            Child.parent_id == current_user.id,
        )
        .first()
    )
    if not vac:
        raise HTTPException(status_code=404, detail="Notification not found")
    path = vac.reminder_audio_path
    if path:
        root = _media_dir()
        file_path = root / path
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass
    vac.reminder_audio_path = None
    db.commit()
    return None
