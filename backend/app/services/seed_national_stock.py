"""Seed sample national stock for vaccines (optional, for supply dashboard)."""
from app.database import SessionLocal
from app.models.national_stock import NationalStock
from app.models.vaccine_template import VaccineTemplate


def seed_national_stock() -> int:
    """
    For each distinct vaccine_name in VaccineTemplate, ensure one NationalStock row
    with current_stock=0 if missing. Returns number of rows inserted.
    """
    db = SessionLocal()
    try:
        names = [r[0] for r in db.query(VaccineTemplate.vaccine_name).distinct().all()]
        inserted = 0
        for vaccine_name in names:
            exists = db.query(NationalStock).filter(
                NationalStock.vaccine_name == vaccine_name
            ).first()
            if not exists:
                db.add(NationalStock(vaccine_name=vaccine_name, current_stock=0))
                inserted += 1
        db.commit()
        return inserted
    finally:
        db.close()
