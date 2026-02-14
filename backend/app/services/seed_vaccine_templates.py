"""Seed Morocco fixed vaccine schedule into VaccineTemplate table."""
from app.database import SessionLocal
from app.models.vaccine_template import VaccineTemplate

# Morocco immunization schedule (period_label, vaccine_name, offset_days)
MOROCCO_SCHEDULE = [
    ("Week 0", "BCG", 0),
    ("Week 6", "DTP1", 42),
    ("Week 6", "Polio1", 42),
    ("Month 2", "DTP2", 60),
    ("Month 2", "Polio2", 60),
    ("Month 4", "DTP3", 120),
    ("Month 4", "Polio3", 120),
]


def seed_vaccine_templates() -> int:
    """
    Insert Morocco vaccine schedule if vaccine_templates is empty.
    Returns number of records inserted (0 if table was not empty).
    """
    db = SessionLocal()
    try:
        if db.query(VaccineTemplate).first() is not None:
            return 0
        for period_label, vaccine_name, offset_days in MOROCCO_SCHEDULE:
            db.add(
                VaccineTemplate(
                    period_label=period_label,
                    vaccine_name=vaccine_name,
                    offset_days=offset_days,
                )
            )
        db.commit()
        return len(MOROCCO_SCHEDULE)
    finally:
        db.close()


if __name__ == "__main__":
    n = seed_vaccine_templates()
    if n:
        print(f"Seeded {n} vaccine templates (Morocco schedule).")
    else:
        print("Vaccine templates already present, skipped seeding.")
