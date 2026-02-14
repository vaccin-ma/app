"""API route modules."""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
def api_root():
    """Placeholder for API root. Add route modules below."""
    return {"api": "v1", "status": "ok"}


from . import child_vaccination
