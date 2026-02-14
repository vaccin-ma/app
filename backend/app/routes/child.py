"""Child management router. Parent must be logged in (get_current_user)."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.parent import Parent
from app.models.vaccine_template import VaccineTemplate
from app.schemas.child import (
    ChildCreate,
    ChildResponse,
    ChildUpdate,
    VaccinationTimelineItem,
)
from app.utils.dependencies import get_current_user

router = APIRouter()


def _get_child_or_404(db: Session, child_id: int, parent: Parent) -> Child:
    child = db.query(Child).filter(
        Child.id == child_id, Child.parent_id == parent.id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


@router.post("/", response_model=ChildResponse, status_code=201)
def create_child(
    payload: ChildCreate,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Create new child for current parent and schedule vaccinations from templates."""
    child = Child(
        parent_id=current_user.id,
        name=payload.name,
        birthdate=payload.birthdate,
        gender=payload.gender,
    )
    db.add(child)
    db.commit()
    db.refresh(child)

    # Create ChildVaccination for each VaccineTemplate (due_date = birthdate + offset_days)
    templates = db.query(VaccineTemplate).all()
    birthdate = child.birthdate
    if birthdate:
        for template in templates:
            due_date = birthdate + timedelta(days=template.offset_days)
            db.add(
                ChildVaccination(
                    child_id=child.id,
                    vaccine_name=template.vaccine_name,
                    period_label=template.period_label,
                    due_date=due_date,
                    completed=False,
                )
            )
        db.commit()

    return child


@router.get("/", response_model=list[ChildResponse])
def list_children(
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """List all children of current parent."""
    children = db.query(Child).filter(Child.parent_id == current_user.id).all()
    return children


def _vaccination_status(due_date: date | None, completed: bool) -> str:
    """Compute status: completed, due, overdue, upcoming."""
    if completed:
        return "completed"
    if due_date is None:
        return "upcoming"
    today = date.today()
    if today == due_date:
        return "due"
    if today > due_date:
        return "overdue"
    return "upcoming"


@router.get("/{child_id}/timeline", response_model=list[VaccinationTimelineItem])
def get_child_timeline(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Fetch all vaccinations for a child (belongs to current parent), sorted by due_date ascending."""
    child = _get_child_or_404(db, child_id, current_user)
    vaccinations = (
        db.query(ChildVaccination)
        .filter(ChildVaccination.child_id == child_id)
        .order_by(ChildVaccination.due_date.asc())
        .all()
    )
    # Backfill: if child has no vaccinations but has birthdate and templates exist, create them
    if not vaccinations and child.birthdate:
        templates = db.query(VaccineTemplate).all()
        for template in templates:
            due_date = child.birthdate + timedelta(days=template.offset_days)
            db.add(
                ChildVaccination(
                    child_id=child.id,
                    vaccine_name=template.vaccine_name,
                    period_label=template.period_label,
                    due_date=due_date,
                    completed=False,
                )
            )
        db.commit()
        vaccinations = (
            db.query(ChildVaccination)
            .filter(ChildVaccination.child_id == child_id)
            .order_by(ChildVaccination.due_date.asc())
            .all()
        )
    return [
        VaccinationTimelineItem(
            period_label=v.period_label,
            vaccine_name=v.vaccine_name,
            due_date=v.due_date,
            completed=v.completed,
            completed_at=v.completed_at,
            status=_vaccination_status(v.due_date, v.completed),
        )
        for v in vaccinations
    ]


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Return child details if belongs to parent."""
    return _get_child_or_404(db, child_id, current_user)


@router.put("/{child_id}", response_model=ChildResponse)
def update_child(
    child_id: int,
    payload: ChildUpdate,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Update child info. Only if belongs to parent."""
    child = _get_child_or_404(db, child_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(child, field, value)
    db.commit()
    db.refresh(child)
    return child


@router.delete("/{child_id}")
def delete_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Delete child. Only if belongs to parent. Return success message."""
    child = _get_child_or_404(db, child_id, current_user)
    db.delete(child)
    db.commit()
    return {"message": "Child deleted successfully"}
