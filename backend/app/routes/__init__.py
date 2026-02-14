"""API route modules."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.region import Region
from app.models.vaccine_template import VaccineTemplate

router = APIRouter()


@router.get("")
def api_root():
    """Placeholder for API root. Add route modules below."""
    return {"api": "v1", "status": "ok"}


@router.get("/vaccines", response_model=list[str])
def list_vaccines(db: Session = Depends(get_db)):
    """List distinct vaccine names (for admin and public dropdown)."""
    rows = db.query(VaccineTemplate.vaccine_name).distinct().order_by(VaccineTemplate.vaccine_name).all()
    return [r[0] for r in rows]


@router.get("/regions")
def list_regions(db: Session = Depends(get_db)):
    """List regions (for signup region selector, public)."""
    regions = db.query(Region).order_by(Region.id).all()
    return [{"id": r.id, "name": r.name} for r in regions]


from . import child_vaccination
