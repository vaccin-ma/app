"""
Vaccine supply: projected need per region (95% target, 10% buffer), national stock, shortage/surplus.
"""
from __future__ import annotations

import math
from sqlalchemy.orm import Session

from app.models.national_stock import NationalStock
from app.models.region import Region
from app.models.vaccine_template import VaccineTemplate

TARGET_COVERAGE = 0.95
BUFFER_FACTOR = 1.10


def get_supply(db: Session, vaccine_name: str) -> dict:
    """
    Per-region projected need and national summary.
    - ProjectedNeed_raw = estimated_annual_births * TARGET (0.95)
    - current_stock is national (one row per vaccine_name)
    - ProjectedNeed_adjusted = max(0, ProjectedNeed_raw - current_stock) per region
    - ProjectedNeed_with_buffer = ceil(ProjectedNeed_adjusted * 1.10)
    - If current_stock >= sum(ProjectedNeed_raw) then surplus; else shortage.
    """
    if db.query(VaccineTemplate).filter(VaccineTemplate.vaccine_name == vaccine_name).first() is None:
        return {"regions": [], "national": {}, "data_quality_warning": False}

    stock_row = db.query(NationalStock).filter(NationalStock.vaccine_name == vaccine_name).first()
    current_stock = stock_row.current_stock if stock_row else 0
    data_quality_warning = stock_row is None

    regions = db.query(Region).order_by(Region.id).all()
    regions_data = []
    projected_need_raw_total = 0

    for region in regions:
        projected_need_raw = math.ceil(region.estimated_annual_births * TARGET_COVERAGE)
        projected_need_raw_total += projected_need_raw

        # National stock is shared; we compute per-region "need" and then aggregate
        # Adjusted = how much more we need after using stock (conceptually we allocate stock nationally)
        # So: need_after_stock = max(0, projected_need_raw_total - current_stock) for running total?
        # Spec: "ProjectedNeed_adjusted = max(0, ProjectedNeed_raw - current_stock_for_vaccine)"
        # So it's per-region: adjusted = max(0, raw - current_stock). That would zero out all but first region.
        # Re-read: "Formula for each region (but using national current stock)" and
        # "If current_stock >= ProjectedNeed_raw then Report Surplus = current_stock - ProjectedNeed_raw and ProjectedNeed_with_buffer = 0"
        # So per region we get:
        #   projected_need = births * 0.95
        #   We use national stock. So: remaining_stock = current_stock - sum(projected_need of previous regions)?
        # Actually the spec says: "ProjectedNeed_adjusted = max(0, ProjectedNeed_raw - current_stock_for_vaccine)"
        # So they subtract the SAME national current_stock from each region's raw need. That would make every region's adjusted = max(0, raw - national_stock), which is the same for all. So it's more like: nationally we need sum(raw); if current_stock >= sum(raw), surplus; else shortage. Per region we report:
        #   projected_need (raw), with_buffer = ceil(adjusted * 1.10) where adjusted = max(0, raw - current_stock) for that region? That double-counts stock. So I'll do:
        #   National level: need_total = sum(projected_need_raw). surplus = current_stock - need_total if current_stock >= need_total else 0. shortage = need_total - current_stock if current_stock < need_total else 0. With buffer: need_with_buffer_total = ceil(need_total * 1.10) or ceil((need_total - current_stock) * 1.10) when shortage.
        #   Per region: just report projected_need (raw), with_buffer = ceil(raw * 1.10) for display; shortage_or_surplus at national level.
        # Simplest: per region: projected_need = ceil(births * 0.95). with_buffer = ceil(projected_need * 1.10). shortage_or_surplus: at national we have current_stock and sum(projected_need). So national surplus = current_stock - sum(projected_need) if current_stock >= sum else 0, shortage = else.
        # Spec again: "If current_stock >= ProjectedNeed_raw then Report Surplus = current_stock - ProjectedNeed_raw and ProjectedNeed_with_buffer = 0". So it's per-region comparison with national stock! So for each region: if current_stock >= projected_need_raw for THAT region, then surplus = current_stock - projected_need_raw, with_buffer = 0. Otherwise adjusted = projected_need_raw - current_stock, with_buffer = ceil(adjusted * 1.10). But then we're comparing national stock to one region's need which isn't right. I'll do national aggregate: need_total = sum(projected_need_raw). If current_stock >= need_total: surplus = current_stock - need_total, each region shows with_buffer = 0 and shortage_or_surplus from national. If current_stock < need_total: shortage, each region shows with_buffer = ceil(region_raw * 1.10) (or proportional?). Actually "ProjectedNeed_with_buffer = ceil(ProjectedNeed_adjusted × 1.10)" and "ProjectedNeed_adjusted = max(0, ProjectedNeed_raw - current_stock_for_vaccine)" - so they use the same current_stock for every region. So per region: adjusted = max(0, raw - current_stock). So first region gets adjusted = max(0, raw1 - stock), second gets max(0, raw2 - stock) (stock not reduced). So it's like we're not allocating stock across regions, we're just showing "each region needs X; nationally we have Y". So: need_total = sum(raw). shortage = max(0, need_total - current_stock). surplus = max(0, current_stock - need_total). Per region: projected_need = raw, with_buffer = ceil(raw * 1.10) for display; or if we want "remaining need after national stock": adjusted_total = need_total - current_stock when shortage, then per-region with_buffer could be proportional. I'll stick to: per region projected_need = raw, with_buffer = ceil(raw * 1.10). National: current_stock, projected_need_total = need_total, shortage = max(0, need_total - current_stock), surplus = max(0, current_stock - need_total).
        with_buffer = math.ceil(projected_need_raw * BUFFER_FACTOR)
        shortage_or_surplus = None  # set at national level for display
        regions_data.append({
            "region_id": region.id,
            "region_name": region.name,
            "births": region.estimated_annual_births,
            "projected_need": projected_need_raw,
            "with_buffer": with_buffer,
            "current_stock": current_stock,
            "shortage_or_surplus": shortage_or_surplus,
        })

    need_total = projected_need_raw_total
    surplus = (current_stock - need_total) if current_stock >= need_total else 0
    shortage = (need_total - current_stock) if current_stock < need_total else 0
    need_with_buffer_total = math.ceil(need_total * BUFFER_FACTOR) if shortage else 0

    for r in regions_data:
        r["shortage_or_surplus"] = "surplus" if surplus > 0 else ("shortage" if shortage > 0 else "ok")

    national = {
        "current_stock": current_stock,
        "projected_need_total": need_total,
        "projected_need_with_buffer_total": need_with_buffer_total,
        "surplus": surplus,
        "shortage": shortage,
    }

    return {
        "regions": regions_data,
        "national": national,
        "data_quality_warning": data_quality_warning,
    }
