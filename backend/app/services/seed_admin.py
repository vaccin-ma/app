"""Seed default admin user on startup if none exists."""
from app.config import settings
from app.database import SessionLocal
from app.models.parent import Parent
from app.utils.security import hash_password


def seed_admin():
    """Create default admin user if no admin exists in the database."""
    db = SessionLocal()
    try:
        existing_admin = db.query(Parent).filter(Parent.is_admin == True).first()
        if existing_admin:
            return
        
        admin = Parent(
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            name=settings.admin_name,
            is_admin=True,
            preferred_language="fr",
            phone_number=None,
            region_id=None,
        )
        db.add(admin)
        db.commit()
        print(f"Default admin user created: {settings.admin_email}")
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()
