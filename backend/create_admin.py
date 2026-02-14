import sys
import os

# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.parent import Parent
from app.utils.security import hash_password

def create_admin_user():
    db = SessionLocal()
    try:
        email = "Jelba.admin@jelba.ma"
        password = "admin123"
        
        # Check if user exists
        user = db.query(Parent).filter(Parent.email == email).first()
        
        hashed_pw = hash_password(password)
        
        if user:
            print(f"User {email} already exists. Updating password and permissions...")
            user.password_hash = hashed_pw
            user.is_admin = True
            user.name = "Admin Jelba" # Ensure name is set
        else:
            print(f"Creating new admin user {email}...")
            user = Parent(
                email=email,
                password_hash=hashed_pw,
                name="Admin Jelba",
                is_admin=True,
                phone_number=None,
                preferred_language="fr",
                region_id=None
            )
            db.add(user)
        
        db.commit()
        print("Admin user created/updated successfully!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
