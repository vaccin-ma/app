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


def _group_key(vac: ChildVaccination) -> tuple[int, str, str | None]:
    """(child_id, period_label, due_date_str) for grouping one notification per period."""
    due = str(vac.due_date) if vac.due_date else None
    return (vac.child_id, vac.period_label or "", due)


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """
    List voice reminders for the current user's children.
    One entry per period (e.g. Semaine 4): vaccine_names lists all vaccines in that period.
    """
    q = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            Child.parent_id == current_user.id,
            ChildVaccination.reminder_audio_path.isnot(None),
        )
        .order_by(ChildVaccination.child_id, ChildVaccination.period_label, ChildVaccination.due_date)
    )
    rows = q.all()
    # One notification per (child_id, period_label, due_date); use first vac id for audio/delete
    seen: set[tuple[int, str, str | None]] = set()
    out = []
    for vac in rows:
        key = _group_key(vac)
        if key in seen:
            continue
        seen.add(key)
        vaccine_names = [v.vaccine_name for v in rows if _group_key(v) == key]
        out.append({
            "id": vac.id,
            "child_id": vac.child_id,
            "child_name": vac.child.name,
            "vaccine_name": ", ".join(vaccine_names),
            "vaccine_names": vaccine_names,
            "period_label": vac.period_label,
            "due_date": str(vac.due_date) if vac.due_date else None,
            "audio_url": f"/reminders/audio/{vac.id}",
        })
    return out[:50]


@router.delete("/{vaccination_id}", status_code=204)
def delete_notification(
    vaccination_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """
    Delete the voice reminder for this period: clear reminder_audio_path for all vaccinations
    in the same (child, period_label), delete the audio file once.
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
    # Clear same period for this child (all vacs sharing this reminder_audio_path)
    period_label = vac.period_label or ""
    same_period = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            Child.parent_id == current_user.id,
            ChildVaccination.child_id == vac.child_id,
            ChildVaccination.period_label == period_label,
            ChildVaccination.reminder_audio_path.isnot(None),
        )
    )
    for v in same_period:
        v.reminder_audio_path = None
    if path:
        root = _media_dir()
        file_path = root / path
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass
    db.commit()
    return None
