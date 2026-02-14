# Coverage aggregation per region for a vaccine
import json
from datetime import date, datetime
from typing import Literal

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.coverage_report import CoverageReport
from app.models.parent import Parent
from app.models.region import Region
from app.models.vaccine_template import VaccineTemplate

TARGET_COVERAGE = 0.95
YELLOW_THRESHOLD = 0.85
CoverageMode = Literal["registered_children", "vaccination_records"]


def get_coverage(
    db: Session,
    vaccine_name: str,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
    use_cache: bool = True,
    refresh: bool = False,
    mode: CoverageMode = "registered_children",
) -> list[dict]:
    """Per-region coverage: total_registered, vaccinated_count, coverage_pct, color."""
    if db.query(VaccineTemplate).filter(VaccineTemplate.vaccine_name == vaccine_name).first() is None:
        return []

    if use_cache and not refresh:
        cached = (
            db.query(CoverageReport)
            .filter(CoverageReport.vaccine_name == vaccine_name)
            .order_by(CoverageReport.calculated_at.desc())
            .first()
        )
        if cached:
            return json.loads(cached.payload)

    regions = db.query(Region).order_by(Region.id).all()
    result = []

    for region in regions:
        if mode == "registered_children":
            total_registered = (
                db.query(Child)
                .outerjoin(Parent, Child.parent_id == Parent.id)
                .filter(
                    or_(
                        Child.region_id == region.id,
                        and_(Child.region_id.is_(None), Parent.region_id == region.id),
                    )
                )
                .count()
            )
        else:
            total_registered = (
                db.query(ChildVaccination)
                .join(Child, ChildVaccination.child_id == Child.id)
                .outerjoin(Parent, Child.parent_id == Parent.id)
                .filter(
                    ChildVaccination.vaccine_name == vaccine_name,
                    or_(
                        Child.region_id == region.id,
                        and_(Child.region_id.is_(None), Parent.region_id == region.id),
                    ),
                )
                .count()
            )

        q = (
            db.query(ChildVaccination)
            .join(Child, ChildVaccination.child_id == Child.id)
            .outerjoin(Parent, Child.parent_id == Parent.id)
            .filter(
                ChildVaccination.vaccine_name == vaccine_name,
                ChildVaccination.completed == True,
                or_(
                    Child.region_id == region.id,
                    and_(Child.region_id.is_(None), Parent.region_id == region.id),
                ),
            )
        )
        if date_from:
            q = q.filter(ChildVaccination.completed_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            q = q.filter(ChildVaccination.completed_at <= datetime.combine(date_to, datetime.max.time()))
        vaccinated_count = q.count()

        if total_registered == 0:
            coverage_pct = 0.0
            color = "red"
            note = "no_data"
        else:
            coverage_pct = round(vaccinated_count / total_registered, 4)
            color = "green" if coverage_pct >= TARGET_COVERAGE else ("yellow" if coverage_pct >= YELLOW_THRESHOLD else "red")
            note = None

        result.append({
            "region_id": region.id,
            "region_name": region.name,
            "population_2024": region.population_2024,
            "estimated_annual_births": region.estimated_annual_births,
            "total_registered": total_registered,
            "vaccinated_count": vaccinated_count,
            "coverage_pct": coverage_pct,
            "coverage_pct_display": round(coverage_pct * 100, 2),
            "color": color,
            "note": note,
        })

    return result


def cache_coverage_report(db: Session, vaccine_name: str, payload: list[dict]) -> None:
    db.add(CoverageReport(vaccine_name=vaccine_name, payload=json.dumps(payload)))
    db.commit()
