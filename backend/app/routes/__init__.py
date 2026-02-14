"""API route modules."""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
def api_root():
    """Placeholder for API root. Add route modules below."""
    return {"api": "v1", "status": "ok"}


# Import and include route modules here, e.g.:
# from app.routes import auth, users
# router.include_router(auth.router, prefix="/auth", tags=["auth"])
# router.include_router(users.router, prefix="/users", tags=["users"])
