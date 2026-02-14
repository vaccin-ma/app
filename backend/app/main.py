"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import auth, child, child_vaccination, reminder, router as api_router

# Import all models so they register with Base (add new model imports in app.models.__init__)
import app.models  # noqa: F401

# Create tables automatically on startup
Base.metadata.create_all(bind=engine)
from app.database import ensure_reminder_audio_column
ensure_reminder_audio_column()

# Seed Morocco 2025 PNI schedule (no-op if already seeded)
from app.services.seed_vaccine_templates import seed_vaccine_templates
seed_vaccine_templates()

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

# Root route
@app.get("/")
def root():
    return {"message": "Vaccine Reminder API is running"}
