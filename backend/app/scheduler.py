"""Daily background job: refresh cached coverage reports for all vaccines."""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.models.vaccine_template import VaccineTemplate
from app.services.coverage_service import cache_coverage_report, get_coverage


def _refresh_coverage_job() -> None:
    """Recompute and cache coverage for each vaccine."""
    db = SessionLocal()
    try:
        vaccines = [r[0] for r in db.query(VaccineTemplate.vaccine_name).distinct().all()]
        for vaccine_name in vaccines:
            data = get_coverage(db, vaccine_name, use_cache=False, refresh=False)
            if data:
                cache_coverage_report(db, vaccine_name, data)
    finally:
        db.close()


def start_scheduler() -> BackgroundScheduler:
    """Run daily at 02:00 to refresh coverage cache."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(_refresh_coverage_job, CronTrigger(hour=2, minute=0))
    scheduler.start()
    return scheduler
