"""Seed Morocco 2025 National Immunisation Calendar into VaccineTemplate table."""
from app.database import SessionLocal
from app.models.vaccine_template import VaccineTemplate

# ── Calendrier National de Vaccination 2025 ──────────────────────────
# Exact mapping from the official PNI table.
# (period_label, vaccine_name, vaccine_group, offset_days)
MOROCCO_SCHEDULE = [
    # ── Naissance / 0–4 semaines ──────────────────────────────────
    ("Naissance",               "HB1",      "Hépatite B (HB)",                  0),
    ("Naissance",               "BCG",      "BCG (Tuberculose)",                0),
    ("Naissance",               "VPO-0",    "Poliomyélite Orale (VPO)",         0),

    # ── 8 semaines (~2 mois) ─────────────────────────────────────
    ("8 sem (~2 mois)",         "VPO-1",    "Poliomyélite Orale (VPO)",         56),
    ("8 sem (~2 mois)",         "Penta-1",  "Pentavalent (DTC-Hib-HB)",         56),
    ("8 sem (~2 mois)",         "Rota-1",   "Rotavirus",                        56),

    # ── 10 semaines (~2½ mois) ───────────────────────────────────
    ("10 sem (~2½ mois)",       "PCV-1",    "Pneumocoque (PCV)",                70),

    # ── 12 semaines (~3 mois) ────────────────────────────────────
    ("12 sem (~3 mois)",        "VPO-2",    "Poliomyélite Orale (VPO)",         84),
    ("12 sem (~3 mois)",        "Penta-2",  "Pentavalent (DTC-Hib-HB)",         84),
    ("12 sem (~3 mois)",        "Rota-2",   "Rotavirus",                        84),

    # ── 16 semaines (~4 mois) ────────────────────────────────────
    ("16 sem (~4 mois)",        "VPO-3",    "Poliomyélite Orale (VPO)",         112),
    ("16 sem (~4 mois)",        "Penta-3",  "Pentavalent (DTC-Hib-HB)",         112),
    ("16 sem (~4 mois)",        "Rota-3",   "Rotavirus",                        112),
    ("16 sem (~4 mois)",        "VPI-1",    "Poliomyélite Injectable (VPI)",     112),

    # ── 18 semaines (~4½ mois) ───────────────────────────────────
    ("18 sem (~4½ mois)",       "PCV-2",    "Pneumocoque (PCV)",                126),

    # ── 6 mois ───────────────────────────────────────────────────
    ("6 mois",                  "PCV-3",    "Pneumocoque (PCV)",                180),

    # ── 9 mois ───────────────────────────────────────────────────
    ("9 mois",                  "VPI-2",    "Poliomyélite Injectable (VPI)",     270),
    ("9 mois",                  "RR-1",     "Rougeole-Rubéole (RR)",            270),

    # ── 12 mois ──────────────────────────────────────────────────
    ("12 mois",                 "PCV-4",    "Pneumocoque (PCV)",                365),

    # ── 18 mois ──────────────────────────────────────────────────
    ("18 mois",                 "VPO-4",    "Poliomyélite Orale (VPO)",         548),
    ("18 mois",                 "RR-2",     "Rougeole-Rubéole (RR)",            548),

    # ── 5 ans ────────────────────────────────────────────────────
    ("5 ans",                   "VPO-5",    "Poliomyélite Orale (VPO)",         1825),
    ("5 ans",                   "DTC-1",    "DTC (Rappel)",                     1825),

    # ── 11 ans ───────────────────────────────────────────────────
    ("11 ans",                  "DTC-2",    "DTC (Rappel)",                     4015),
    ("11 ans",                  "HPV",      "Papillomavirus (HPV)",             4015),
]


def seed_vaccine_templates() -> int:
    """
    Insert Morocco 2025 vaccine schedule if vaccine_templates is empty.
    Returns number of records inserted (0 if table was not empty).
    """
    db = SessionLocal()
    try:
        if db.query(VaccineTemplate).first() is not None:
            return 0
        for period_label, vaccine_name, vaccine_group, offset_days in MOROCCO_SCHEDULE:
            db.add(
                VaccineTemplate(
                    period_label=period_label,
                    vaccine_name=vaccine_name,
                    vaccine_group=vaccine_group,
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
        print(f"Seeded {n} vaccine templates (Morocco 2025 schedule).")
    else:
        print("Vaccine templates already present, skipped seeding.")
