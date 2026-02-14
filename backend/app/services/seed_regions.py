"""Seed 12 Moroccan regions (population 2024, estimated annual births)."""
from app.database import SessionLocal
from app.models.region import Region

# Exact numbers from requirements (name, population_2024, estimated_annual_births)
MOROCCO_REGIONS = [
    ("Tanger-Tétouan-Al Hoceima", 4_030_222, 67_300),
    ("L'Oriental", 2_294_665, 38_300),
    ("Fès-Meknès", 4_467_911, 74_400),
    ("Rabat-Salé-Kénitra", 5_132_639, 85_700),
    ("Béni Mellal-Khénifra", 2_525_801, 42_200),
    ("Casablanca-Settat", 7_688_967, 128_400),
    ("Marrakech-Safi", 4_892_393, 81_700),
    ("Drâa-Tafilalet", 1_655_623, 27_700),
    ("Souss-Massa", 3_020_431, 50_400),
    ("Guelmim-Oued Noun", 448_685, 7_500),
    ("Laâyoune-Sakia El Hamra", 451_028, 7_500),
    ("Dakhla-Oued Ed-Dahab", 219_965, 3_700),
]


def seed_regions() -> int:
    """
    Insert the 12 Moroccan regions if regions table is empty.
    Returns number of records inserted (0 if already seeded).
    """
    db = SessionLocal()
    try:
        if db.query(Region).first() is not None:
            return 0
        for name, population_2024, estimated_annual_births in MOROCCO_REGIONS:
            db.add(
                Region(
                    name=name,
                    population_2024=population_2024,
                    estimated_annual_births=estimated_annual_births,
                )
            )
        db.commit()
        return len(MOROCCO_REGIONS)
    finally:
        db.close()


if __name__ == "__main__":
    n = seed_regions()
    if n:
        print(f"Seeded {n} regions.")
    else:
        print("Regions already present, skipped seeding.")
