"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import admin, auth, child, child_vaccination, reminder, notifications
from app.routes import router as api_router

# Import all models so they register with Base (add new model imports in app.models.__init__)
import app.models  # noqa: F401

# Create tables automatically on startup
Base.metadata.create_all(bind=engine)
from app.database import ensure_sqlite_columns
ensure_sqlite_columns()

# Seed Morocco 2025 PNI schedule (no-op if already seeded)
from app.services.seed_vaccine_templates import seed_vaccine_templates
seed_vaccine_templates()

# Seed 12 Moroccan regions (no-op if already seeded)
from app.services.seed_regions import seed_regions
seed_regions()

# Seed national stock rows per vaccine (no-op if already present)
from app.services.seed_national_stock import seed_national_stock
seed_national_stock()

# Seed realistic demo data: parents, children, vaccinations (skips if already present)
from app.services.seed_fake_data import seed_fake_data
seed_fake_data()

app = FastAPI(
    title="Vaccine Reminder API",
    description="API for vaccine tracking and reminders",
    version="1.0.0",
    debug=settings.debug,
)

# CORS: allow all origins for now (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API router placeholder for future routes
app.include_router(api_router, prefix="/api")
app.include_router(auth.router)
app.include_router(child.router, prefix="/children", tags=["Children"])
app.include_router(child_vaccination.router, prefix="/vaccinations", tags=["Vaccinations"])
app.include_router(reminder.router, prefix="/reminders", tags=["Reminders"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(admin.router)

# Optional: daily refresh of coverage cache (uncomment to enable)
# from app.scheduler import start_scheduler
# _scheduler = start_scheduler()

# Root route
@app.get("/")
def root():
    return {"message": "Vaccine Reminder API is running"}
