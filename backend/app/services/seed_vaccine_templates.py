"""Seed vaccine schedule into VaccineTemplate table."""
from app.config import settings
from app.database import SessionLocal
from app.models.vaccine_template import VaccineTemplate
from app.models.child_vaccination import ChildVaccination
from app.models.child import Child
from app.models.parent import Parent

# Schedule: (period_label, vaccine_name, vaccine_group, offset_days)
# offset_days = days after birth
SCHEDULE = [
    # Semaine 4 (Week 4) = 28 days
    ("Semaine 4", "HB1", "Hépatite B (HB)", 28),
    ("Semaine 4", "BCG", "BCG (Tuberculose)", 28),
    ("Semaine 4", "VPO0", "Poliomyélite Orale (VPO)", 28),

    # Semaine 8 = 56 days
    ("Semaine 8", "VPO1", "Poliomyélite Orale (VPO)", 56),
    ("Semaine 8", "Penta1", "Pentavalent (DTC-Hib-HB)", 56),
    ("Semaine 8", "Rota1", "Rotavirus", 56),

    # Semaine 10 = 70 days
    ("Semaine 10", "PCV1", "Pneumocoque (PCV)", 70),

    # Semaine 12 = 84 days
    ("Semaine 12", "VPO2", "Poliomyélite Orale (VPO)", 84),
    ("Semaine 12", "Penta2", "Pentavalent (DTC-Hib-HB)", 84),
    ("Semaine 12", "Rota2", "Rotavirus", 84),

    # Semaine 16 = 112 days
    ("Semaine 16", "VPO3", "Poliomyélite Orale (VPO)", 112),
    ("Semaine 16", "Penta3", "Pentavalent (DTC-Hib-HB)", 112),
    ("Semaine 16", "Rota3", "Rotavirus", 112),
    ("Semaine 16", "VPI1", "Poliomyélite Injectable (VPI)", 112),

    # Semaine 18 = 126 days
    ("Semaine 18", "PCV2", "Pneumocoque (PCV)", 126),

    # Mois 6 = 180 days
    ("Mois 6", "PCV3", "Pneumocoque (PCV)", 180),

    # Mois 9 = 270 days
    ("Mois 9", "VPI2", "Poliomyélite Injectable (VPI)", 270),
    ("Mois 9", "RR1", "Rougeole-Rubéole (RR)", 270),

    # Mois 12 = 365 days
    ("Mois 12", "PCV4", "Pneumocoque (PCV)", 365),

    # Mois 18 = 548 days
    ("Mois 18", "VPO4", "Poliomyélite Orale (VPO)", 548),
    ("Mois 18", "RR2", "Rougeole-Rubéole (RR)", 548),
    ("Mois 18", "DTC1", "DTC (Rappel)", 548),

    # Années 5 = 1825 days
    ("Années 5", "VPO5", "Poliomyélite Orale (VPO)", 1825),
    ("Années 5", "DTC2", "DTC (Rappel)", 1825),

    # Années 11 = 4015 days
    ("Années 11", "HPV", "Papillomavirus (HPV)", 4015),
]


def seed_vaccine_templates() -> int:
    """
    Always replace vaccine_templates with current SCHEDULE so new children get the
    correct schedule (Semaine 4, Mois 6, etc.). If replace_vaccine_templates is True,
    also clear all child_vaccinations so existing children get backfilled with the new
    schedule on next timeline load.
    Returns number of template records inserted.
    """
    db = SessionLocal()
    try:
        if getattr(settings, "replace_vaccine_templates", False):
            db.query(ChildVaccination).delete()
            # Remove demo parents and their children so seed_fake_data can recreate with new schedule
            demo_parent_ids = [r[0] for r in db.query(Parent.id).filter(Parent.email.like("%@example.ma")).all()]
            if demo_parent_ids:
                db.query(Child).filter(Child.parent_id.in_(demo_parent_ids)).delete(
                    synchronize_session=False
                )
                db.query(Parent).filter(Parent.email.like("%@example.ma")).delete()
            db.commit()

        db.query(VaccineTemplate).delete()
        db.commit()

        for period_label, vaccine_name, vaccine_group, offset_days in SCHEDULE:
            db.add(
                VaccineTemplate(
                    period_label=period_label,
                    vaccine_name=vaccine_name,
                    vaccine_group=vaccine_group,
                    offset_days=offset_days,
                )
            )
        db.commit()
        return len(SCHEDULE)
    finally:
        db.close()


if __name__ == "__main__":
    n = seed_vaccine_templates()
    if n:
        print(f"Seeded {n} vaccine templates.")
    else:
        print("Vaccine templates already present, skipped seeding.")
