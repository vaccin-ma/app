"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parent import Parent
from app.schemas.parent import ParentCreate, ParentLogin, ParentResponse, PreferredLanguageUpdate
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ParentResponse)
def register(parent_in: ParentCreate, db: Session = Depends(get_db)):
    """Register a new parent. Email must be unique."""
    existing = db.query(Parent).filter(Parent.email == parent_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    parent = Parent(
        name=parent_in.name,
        email=parent_in.email,
        password_hash=hash_password(parent_in.password),
        phone_number=parent_in.phone_number,
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)
    return parent


@router.post("/login")
def login(credentials: ParentLogin, db: Session = Depends(get_db)):
    """Login with email and password. Returns JWT access token."""
    parent = db.query(Parent).filter(Parent.email == credentials.email).first()
    if not parent:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(credentials.password, parent.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": parent.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=ParentResponse)
def get_me(current_user: Parent = Depends(get_current_user)):
    """Return the current authenticated parent (for profile and preferred_language)."""
    return current_user


@router.patch("/me", response_model=ParentResponse)
def update_me(
    body: PreferredLanguageUpdate,
    db: Session = Depends(get_db),
    current_user: Parent = Depends(get_current_user),
):
    """Update current user's preferred language for voice notifications (ar, fr, en)."""
    current_user.preferred_language = body.preferred_language
    db.commit()
    db.refresh(current_user)
    return current_user
