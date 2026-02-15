"""
Seed realistic fake data for demo: parents, children, vaccinations, national stock.
Uses Moroccan-style names and varied coverage by region so admin dashboard looks real.
Run once; adds only demo parents that don't already exist (by email).
"""
from datetime import date, datetime, timedelta
import random

from app.database import SessionLocal
from app.models.parent import Parent
from app.models.child import Child
from app.models.child_vaccination import ChildVaccination
from app.models.region import Region
from app.models.vaccine_template import VaccineTemplate
from app.models.national_stock import NationalStock
from app.utils.security import hash_password

DEMO_PASSWORD = "Demo123!"  # same for all demo accounts

# Demo parents: (name, email, phone, region_id) — region_id 1–12, spread across all regions
DEMO_PARENTS = [
    # Casablanca-Settat (6) — high coverage region
    ("Fatima El Amrani", "fatima.elamrani@example.ma", "+212 661-112233", 6),
    ("Mohammed Bennani", "mohammed.bennani@example.ma", "+212 662-223344", 6),
    ("Zineb Kettani", "zineb.kettani@example.ma", "+212 661-234567", 6),
    ("Rachid Fahmi", "rachid.fahmi@example.ma", "+212 662-345678", 6),
    ("Nadia Bensouda", "nadia.bensouda@example.ma", "+212 663-456789", 6),
    # Rabat-Salé-Kénitra (4)
    ("Aisha Tazi", "aisha.tazi@example.ma", "+212 663-334455", 4),
    ("Youssef Idrissi", "youssef.idrissi@example.ma", "+212 664-445566", 4),
    ("Houda Mansouri", "houda.mansouri@example.ma", "+212 664-567890", 4),
    ("Khalid El Fassi", "khalid.elfassi@example.ma", "+212 665-678901", 4),
    # Fès-Meknès (3)
    ("Khadija Berrada", "khadija.berrada@example.ma", "+212 665-556677", 3),
    ("Abdelilah Tazi", "abdelilah.tazi@example.ma", "+212 666-789012", 3),
    ("Sanae Bennis", "sanae.bennis@example.ma", "+212 667-890123", 3),
    # Marrakech-Safi (7)
    ("Omar Alaoui", "omar.alaoui@example.ma", "+212 666-667788", 7),
    ("Malika Chraibi", "malika.chraibi@example.ma", "+212 668-901234", 7),
    ("Driss Oudghiri", "driss.oudghiri@example.ma", "+212 669-012345", 7),
    # Tanger-Tétouan-Al Hoceima (1)
    ("Laila Chraibi", "laila.chraibi@example.ma", "+212 667-778899", 1),
    ("Fouad Benani", "fouad.benani@example.ma", "+212 660-123456", 1),
    ("Salma El Khatib", "salma.elkhatib@example.ma", "+212 661-234560", 1),
    # Béni Mellal-Khénifra (5)
    ("Hassan Moussaoui", "hassan.moussaoui@example.ma", "+212 668-889900", 5),
    ("Imane Tounsi", "imane.tounsi@example.ma", "+212 662-345601", 5),
    # L'Oriental (2)
    ("Samira Benjelloun", "samira.benjelloun@example.ma", "+212 669-990011", 2),
    ("Tarik Ziyani", "tarik.ziyani@example.ma", "+212 663-456712", 2),
    ("Naima El Ouafi", "naima.elouafi@example.ma", "+212 664-567823", 2),
    # Souss-Massa (9)
    ("Karim Fassi", "karim.fassi@example.ma", "+212 660-100122", 9),
    ("Asmae Amrani", "asmae.amrani@example.ma", "+212 665-678934", 9),
    ("Othman Idrissi", "othman.idrissi@example.ma", "+212 666-789045", 9),
    # Drâa-Tafilalet (8)
    ("Kawtar Bennani", "kawtar.bennani@example.ma", "+212 667-890156", 8),
    ("Jamal El Amrani", "jamal.elamrani@example.ma", "+212 668-901267", 8),
    # Guelmim-Oued Noun (10)
    ("Hanane Tazi", "hanane.tazi@example.ma", "+212 669-012378", 10),
    ("Mustapha Berrada", "mustapha.berrada@example.ma", "+212 660-123489", 10),
    # Laâyoune-Sakia El Hamra (11)
    ("Souad Alaoui", "souad.alaoui@example.ma", "+212 661-234590", 11),
    ("Ibrahim Moussaoui", "ibrahim.moussaoui@example.ma", "+212 662-345601", 11),
    # Dakhla-Oued Ed-Dahab (12)
    ("Farida Chraibi", "farida.chraibi@example.ma", "+212 663-456712", 12),
    ("Younes Fassi", "younes.fassi@example.ma", "+212 664-567823", 12),
]

# Children per parent: list of (child_name, birthdate, gender).
# Variety: 1, 2, 3, or 4+ children per parent for realistic analysis.
DEMO_CHILDREN = [
    [("Inès", date(2023, 5, 12), "F"), ("Mehdi", date(2021, 8, 3), "M"), ("Lina", date(2019, 2, 20), "F")],  # 3
    [("Adam", date(2024, 1, 20), "M")],  # 1
    [("Yasmin", date(2022, 3, 22), "F"), ("Rayan", date(2020, 7, 8), "M")],  # 2
    [("Nour", date(2023, 11, 5), "F"), ("Omar", date(2021, 4, 15), "M"), ("Hana", date(2018, 9, 1), "F")],  # 3
    [("Salma", date(2022, 12, 10), "F"), ("Anas", date(2020, 6, 18), "M"), ("Ibrahim", date(2017, 1, 25), "M"), ("Zineb", date(2015, 8, 12), "F")],  # 4
    [("Lina", date(2023, 9, 1), "F"), ("Omar Jr", date(2020, 11, 15), "M")],  # 2
    [("Houda", date(2024, 2, 28), "F")],  # 1
    [("Amir", date(2021, 5, 3), "M"), ("Laila", date(2019, 10, 22), "F")],  # 2
    [("Youssef", date(2022, 7, 14), "M"), ("Khadija", date(2020, 3, 9), "F"), ("Fatima", date(2018, 12, 5), "F")],  # 3
    [("Yasmin", date(2022, 3, 22), "F")],  # 1
    [("Ibrahim", date(2023, 7, 8), "M"), ("Aya", date(2021, 1, 30), "F")],  # 2
    [("Rayan", date(2020, 4, 17), "M"), ("Nada", date(2018, 11, 8), "F"), ("Adam", date(2016, 6, 25), "M")],  # 3
    [("Nour", date(2022, 12, 10), "F"), ("Rayan", date(2024, 2, 28), "M")],  # 2
    [("Mehdi", date(2023, 4, 5), "M"), ("Inès", date(2021, 8, 12), "F"), ("Omar", date(2019, 2, 28), "M")],  # 3
    [("Salma", date(2021, 10, 3), "F")],  # 1
    [("Anas", date(2022, 6, 18), "M"), ("Hana", date(2020, 2, 14), "F"), ("Youssef", date(2017, 9, 20), "M")],  # 3
    [("Lina", date(2024, 1, 15), "F"), ("Karim", date(2022, 5, 22), "M")],  # 2
    [("Zineb", date(2020, 12, 1), "F"), ("Amir", date(2018, 7, 19), "M"), ("Nour", date(2016, 3, 10), "F"), ("Rayan", date(2014, 11, 5), "M")],  # 4
    [("Amir", date(2023, 10, 30), "M")],  # 1
    [("Hana", date(2021, 2, 8), "F"), ("Othman", date(2019, 6, 14), "M")],  # 2
    [("Yasmin", date(2022, 8, 25), "F"), ("Ibrahim", date(2020, 4, 11), "M"), ("Laila", date(2018, 10, 7), "F")],  # 3
    [("Rayan", date(2023, 3, 18), "M"), ("Nada", date(2021, 9, 5), "F")],  # 2
    [("Adam", date(2020, 1, 22), "M"), ("Salma", date(2018, 5, 30), "F"), ("Mehdi", date(2016, 11, 12), "M")],  # 3
    [("Inès", date(2022, 7, 9), "F")],  # 1
    [("Omar", date(2021, 11, 28), "M"), ("Khadija", date(2019, 4, 16), "F")],  # 2
    [("Nour", date(2023, 6, 2), "F"), ("Anas", date(2021, 12, 19), "M"), ("Hana", date(2019, 8, 3), "F")],  # 3
    [("Youssef", date(2020, 2, 14), "M"), ("Aya", date(2018, 7, 27), "F"), ("Rayan", date(2016, 1, 10), "M"), ("Zineb", date(2014, 9, 5), "F")],  # 4
    [("Lina", date(2022, 4, 8), "F"), ("Amir", date(2020, 10, 21), "M")],  # 2
    [("Mehdi", date(2021, 5, 15), "M")],  # 1
    [("Salma", date(2023, 1, 30), "F"), ("Ibrahim", date(2021, 7, 12), "M"), ("Nada", date(2019, 3, 25), "F")],  # 3
    [("Rayan", date(2020, 9, 8), "M"), ("Fatima", date(2018, 2, 14), "F")],  # 2
    [("Omar", date(2022, 11, 20), "M"), ("Yasmin", date(2020, 6, 5), "F"), ("Adam", date(2017, 12, 18), "M")],  # 3
    [("Hana", date(2024, 3, 10), "F"), ("Anas", date(2022, 8, 22), "M"), ("Laila", date(2020, 1, 15), "F"), ("Youssef", date(2017, 5, 8), "M")],  # 4
]

# Target coverage by region_id (1–12) for realism: green / yellow / red spread
REGION_COVERAGE = {
    1: 0.82,   # Tanger — yellow/red
    2: 0.79,   # Oriental — red
    3: 0.88,   # Fès-Meknès — yellow
    4: 0.91,   # Rabat — yellow/green
    5: 0.85,   # Béni Mellal — yellow
    6: 0.94,   # Casablanca — green
    7: 0.86,   # Marrakech — yellow
    8: 0.76,   # Drâa-Tafilalet — red
    9: 0.84,   # Souss-Massa — yellow
    10: 0.80,  # Guelmim — red
    11: 0.78,  # Laâyoune — red
    12: 0.75,  # Dakhla — red
}

# National stock for new schedule vaccine names (Semaine 4, Mois 6, etc.)
DEMO_NATIONAL_STOCK = {
    "HB1": 900_000,
    "BCG": 850_000,
    "VPO0": 400_000,
    "VPO1": 380_000,
    "Penta1": 350_000,
    "Rota1": 340_000,
    "PCV1": 280_000,
    "VPO2": 370_000,
    "Penta2": 340_000,
    "Rota2": 330_000,
    "VPO3": 360_000,
    "Penta3": 330_000,
    "Rota3": 320_000,
    "VPI1": 350_000,
    "PCV2": 270_000,
    "PCV3": 260_000,
    "VPI2": 340_000,
    "RR1": 320_000,
    "PCV4": 250_000,
    "VPO4": 290_000,
    "RR2": 310_000,
    "DTC1": 300_000,
    "VPO5": 200_000,
    "DTC2": 180_000,
    "HPV": 150_000,
}


def _seed_fake_data() -> dict:
    db = SessionLocal()
    try:
        templates = db.query(VaccineTemplate).order_by(VaccineTemplate.offset_days).all()
        if not templates:
            return {"skipped": True, "reason": "Vaccine templates not seeded"}

        if db.query(Region).count() < 12:
            return {"skipped": True, "reason": "Regions not seeded"}

        pw_hash = hash_password(DEMO_PASSWORD)
        parents_created = 0
        children_created = 0
        vaccinations_created = 0

        for i, (pname, email, phone, region_id) in enumerate(DEMO_PARENTS):
            if db.query(Parent).filter(Parent.email == email).first():
                continue
            parent = Parent(
                name=pname,
                email=email,
                password_hash=pw_hash,
                phone_number=phone,
                region_id=region_id,
                is_admin=False,
            )
            db.add(parent)
            db.flush()
            parents_created += 1

            children_data = DEMO_CHILDREN[i] if i < len(DEMO_CHILDREN) else [("Enfant", date(2023, 6, 1), None)]
            for cname, birthdate, gender in children_data:
                child = Child(
                    parent_id=parent.id,
                    name=cname,
                    birthdate=birthdate,
                    gender=gender,
                    region_id=region_id,
                )
                db.add(child)
                db.flush()
                children_created += 1

                cov = REGION_COVERAGE.get(region_id, 0.85)
                for t in templates:
                    due = birthdate + timedelta(days=t.offset_days) if birthdate else None
                    completion_bias = 1.0 - (t.offset_days / 4000) * 0.1
                    p_complete = min(0.98, cov * completion_bias)
                    completed = random.random() < p_complete
                    completed_at = None
                    if completed and due:
                        days_after = random.randint(0, 14) if due <= date.today() else 0
                        completed_at = datetime.combine(due, datetime.min.time()) + timedelta(days=days_after)
                    db.add(
                        ChildVaccination(
                            child_id=child.id,
                            vaccine_name=t.vaccine_name,
                            vaccine_group=t.vaccine_group,
                            period_label=t.period_label,
                            due_date=due,
                            completed=completed,
                            completed_at=completed_at,
                            remindable=due >= (date.today() - timedelta(days=7)) if due else True,
                        )
                    )
                    vaccinations_created += 1

        db.commit()

        for vname, stock in DEMO_NATIONAL_STOCK.items():
            row = db.query(NationalStock).filter(NationalStock.vaccine_name == vname).first()
            if row:
                row.current_stock = stock
                row.updated_at = datetime.utcnow()
            else:
                db.add(NationalStock(vaccine_name=vname, current_stock=stock))
        db.commit()

        return {
            "skipped": False,
            "parents": parents_created,
            "children": children_created,
            "vaccinations": vaccinations_created,
            "message": f"Added {parents_created} parents, {children_created} children, {vaccinations_created} vaccinations. Demo password: {DEMO_PASSWORD}",
        }
    finally:
        db.close()


def seed_fake_data() -> dict:
    """Public entry: seed demo data. Adds only parents that don't exist (by email)."""
    return _seed_fake_data()


if __name__ == "__main__":
    result = seed_fake_data()
    if result.get("skipped"):
        print("Skipped:", result.get("reason", "unknown"))
    else:
        print(result.get("message", result))
