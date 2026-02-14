"""Child vaccination routes. Parent must be logged in (get_current_user)."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.parent import Parent
from app.schemas.child import ChildVaccinationResponse
from app.utils.dependencies import get_current_user

router = APIRouter()


def _get_vaccination_for_parent(
    db: Session, vaccination_id: int, parent: Parent
) -> ChildVaccination:
    """Fetch ChildVaccination by id; 404 if not found or not owned by parent's child."""
    vaccination = (
        db.query(ChildVaccination)
        .join(Child, ChildVaccination.child_id == Child.id)
        .filter(
            ChildVaccination.id == vaccination_id,
            Child.parent_id == parent.id,
        )
        .first()
    )
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination not found")
    return vaccination


@router.patch("/{vaccination_id}/complete", response_model=ChildVaccinationResponse)
def complete_vaccination(
    vaccination_id: int,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Mark vaccination as completed. Only if it belongs to a child of current parent."""
    vaccination = _get_vaccination_for_parent(db, vaccination_id, current_user)
    vaccination.completed = True
    vaccination.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(vaccination)
    return vaccination
