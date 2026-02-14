"""Admin-only routes: coverage, supply, region detail, Telegram generate/send."""
from datetime import date, datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.parent import Parent
from app.models.region import Region
from app.models.vaccine_template import VaccineTemplate
from app.services.coverage_service import cache_coverage_report, get_coverage
from app.services.supply_service import get_supply
from app.services.telegram_service import (
    generate_telegram_text,
    send_to_region,
)
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


# --- Coverage ---
@router.get("/coverage")
def admin_coverage(
    vaccine: str = Query(..., description="Vaccine name (e.g. DTP1, HB1)"),
    refresh: bool = Query(False, description="Force recompute and cache"),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    mode: Literal["registered_children", "vaccination_records"] = Query("registered_children"),
    db: Session = Depends(get_db),
):
    """Region-by-region coverage with color (green/yellow/red)."""
    data = get_coverage(
        db,
        vaccine,
        date_from=date_from,
        date_to=date_to,
        use_cache=True,
        refresh=refresh,
        mode=mode,
    )
    if not data and db.query(VaccineTemplate).filter(VaccineTemplate.vaccine_name == vaccine).first() is None:
        raise HTTPException(status_code=400, detail="Vaccine not found")
    if refresh and data:
        cache_coverage_report(db, vaccine, data)
    return data


# --- Supply ---
@router.get("/supply")
def admin_supply(
    vaccine: str = Query(..., description="Vaccine name"),
    db: Session = Depends(get_db),
):
    """Per-region projected need and national stock/shortage/surplus."""
    result = get_supply(db, vaccine)
    if not result["regions"] and db.query(VaccineTemplate).filter(VaccineTemplate.vaccine_name == vaccine).first() is None:
        raise HTTPException(status_code=400, detail="Vaccine not found")
    return result


# --- Region detail ---
@router.get("/region/{region_id}/detail")
def admin_region_detail(
    region_id: int,
    vaccine: str = Query(..., description="Vaccine name"),
    db: Session = Depends(get_db),
):
    """Detailed breakdown: registered children, vaccination counts by period, last 30 days, 4-week trend."""
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    if db.query(VaccineTemplate).filter(VaccineTemplate.vaccine_name == vaccine).first() is None:
        raise HTTPException(status_code=400, detail="Vaccine not found")

    # Children in region (child.region_id or parent.region_id)
    children_ids = (
        db.query(Child.id)
        .outerjoin(Parent, Child.parent_id == Parent.id)
        .filter(
            or_(
                Child.region_id == region_id,
                and_(Child.region_id.is_(None), Parent.region_id == region_id),
            )
        )
        .all()
    )
    child_ids = [r[0] for r in children_ids]
    registered_count = len(child_ids)

    if not child_ids:
        return {
            "region_id": region_id,
            "region_name": region.name,
            "vaccine_name": vaccine,
            "registered_children": [],
            "by_period": [],
            "last_30_days_count": 0,
            "trend_weeks": [],
        }

    # Vaccinations for this vaccine in region
    vaccs = (
        db.query(ChildVaccination)
        .filter(
            ChildVaccination.child_id.in_(child_ids),
            ChildVaccination.vaccine_name == vaccine,
        )
        .all()
    )
    by_period: dict[str, dict] = {}
    for v in vaccs:
        key = v.period_label
        if key not in by_period:
            by_period[key] = {"total": 0, "completed": 0}
        by_period[key]["total"] += 1
        if v.completed:
            by_period[key]["completed"] += 1
    by_period_list = [{"period_label": k, **v} for k, v in sorted(by_period.items())]

    # Last 30 days completed
    since = datetime.utcnow() - timedelta(days=30)
    last_30 = (
        db.query(ChildVaccination)
        .filter(
            ChildVaccination.child_id.in_(child_ids),
            ChildVaccination.vaccine_name == vaccine,
            ChildVaccination.completed == True,
            ChildVaccination.completed_at >= since,
        )
        .count()
    )

    # Trend: last 4 weeks (week-by-week completed count)
    trend_weeks = []
    for i in range(4):
        end = datetime.utcnow() - timedelta(weeks=i)
        start = end - timedelta(days=7)
        c = (
            db.query(ChildVaccination)
            .filter(
                ChildVaccination.child_id.in_(child_ids),
                ChildVaccination.vaccine_name == vaccine,
                ChildVaccination.completed == True,
                ChildVaccination.completed_at >= start,
                ChildVaccination.completed_at < end,
            )
            .count()
        )
        trend_weeks.append({"week_end": end.date().isoformat(), "completed_count": c})
    trend_weeks.reverse()

    # List of registered children (id, name, birthdate)
    children_list = (
        db.query(Child.id, Child.name, Child.birthdate)
        .filter(Child.id.in_(child_ids))
        .all()
    )

    return {
        "region_id": region_id,
        "region_name": region.name,
        "vaccine_name": vaccine,
        "registered_children": [{"id": c[0], "name": c[1], "birthdate": str(c[2]) if c[2] else None} for c in children_list],
        "by_period": by_period_list,
        "last_30_days_count": last_30,
        "trend_weeks": trend_weeks,
    }


# --- Telegram ---
class TelegramGenerateBody(BaseModel):
    vaccine_name: str
    region_ids: list[int] = Field(..., min_length=1)
    language: Literal["fr", "darija"] = "fr"
    template_type: Literal["summary", "urgent"] = "summary"


class TelegramSendBody(BaseModel):
    vaccine_name: str
    region_ids: list[int] = Field(..., min_length=1)
    language: Literal["fr", "darija"] = "fr"
    template_type: Literal["summary", "urgent"] = "summary"
    send: bool = True


@router.post("/telegram/generate")
def admin_telegram_generate(
    body: TelegramGenerateBody,
    db: Session = Depends(get_db),
):
    """Generate preview messages for selected regions (no send)."""
    coverage = get_coverage(db, body.vaccine_name, use_cache=True, refresh=False)
    coverage_by_region = {r["region_id"]: r for r in coverage}
    messages = []
    for rid in body.region_ids:
        region = db.query(Region).filter(Region.id == rid).first()
        if not region:
            messages.append({"region_id": rid, "error": "Region not found", "preview": None, "can_send": False})
            continue
        data = coverage_by_region.get(rid, {})
        text = generate_telegram_text(
            region.name,
            body.vaccine_name,
            data,
            language=body.language,
            template_type=body.template_type,
        )
        can_send = bool(region.telegram_chat_id and region.telegram_chat_id.strip())
        messages.append({
            "region_id": rid,
            "region_name": region.name,
            "preview": text,
            "can_send": can_send,
            "error": None if can_send else "telegram_chat_id not configured",
        })
    return {"messages": messages}


@router.post("/telegram/send")
def admin_telegram_send(
    body: TelegramSendBody,
    db: Session = Depends(get_db),
):
    """Send generated messages via Telegram Bot. Logs to TelegramLog."""
    if not body.send:
        return {"sent": [], "errors": ["send is false, no messages sent"]}
    coverage = get_coverage(db, body.vaccine_name, use_cache=True, refresh=False)
    coverage_by_region = {r["region_id"]: r for r in coverage}
    results = []
    for i, rid in enumerate(body.region_ids):
        region = db.query(Region).filter(Region.id == rid).first()
        if not region:
            results.append({"region_id": rid, "success": False, "error": "Region not found"})
            continue
        data = coverage_by_region.get(rid, {})
        text = generate_telegram_text(
            region.name,
            body.vaccine_name,
            data,
            language=body.language,
            template_type=body.template_type,
        )
        out = send_to_region(db, rid, body.vaccine_name, text, delay_seconds=0.5)
        results.append({
            "region_id": rid,
            "success": out["success"],
            "error": out["response"].get("error") if not out["success"] else None,
        })
    return {"results": results}


# --- Regions list and update telegram_chat_id ---
@router.get("/regions")
def admin_list_regions(db: Session = Depends(get_db)):
    """List all regions with optional telegram_chat_id."""
    regions = db.query(Region).order_by(Region.id).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "population_2024": r.population_2024,
            "estimated_annual_births": r.estimated_annual_births,
            "telegram_chat_id": r.telegram_chat_id,
        }
        for r in regions
    ]


class RegionTelegramUpdate(BaseModel):
    telegram_chat_id: str | None = None


@router.patch("/region/{region_id}")
def admin_update_region(
    region_id: int,
    body: RegionTelegramUpdate,
    db: Session = Depends(get_db),
):
    """Set or clear telegram_chat_id for a region."""
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    region.telegram_chat_id = (body.telegram_chat_id or "").strip() or None
    db.commit()
    db.refresh(region)
    return {"id": region.id, "telegram_chat_id": region.telegram_chat_id}
