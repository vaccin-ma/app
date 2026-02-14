"""Admin management router."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.parent import Parent

router = APIRouter()


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Get platform-wide statistics for the admin dashboard."""
    total_parents = db.query(Parent).count()
    total_children = db.query(Child).count()
    total_vaccinations = db.query(ChildVaccination).count()
    completed_vaccinations = (
        db.query(ChildVaccination).filter(ChildVaccination.completed == True).count()  # noqa: E712
    )

    overall_coverage_percent = 0.0
    if total_vaccinations > 0:
        overall_coverage_percent = (completed_vaccinations / total_vaccinations) * 100

    # Vaccines by group (completed only)
    vaccines_by_group_query = (
        db.query(ChildVaccination.vaccine_group, func.count(ChildVaccination.id))
        .filter(ChildVaccination.completed == True)  # noqa: E712
        .group_by(ChildVaccination.vaccine_group)
        .all()
    )
    vaccines_by_group = [
        {"name": group, "value": count} for group, count in vaccines_by_group_query
    ]

    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_registrations = (
        db.query(Child).filter(Child.created_at >= thirty_days_ago).count()
    )

    return {
        "total_parents": total_parents,
        "total_children": total_children,
        "total_vaccinations": total_vaccinations,
        "completed_vaccinations": completed_vaccinations,
        "overall_coverage_percent": round(overall_coverage_percent, 1),
        "vaccines_by_group": vaccines_by_group,
        "recent_registrations": recent_registrations,
    }
