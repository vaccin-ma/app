#!/usr/bin/env python3
"""
Reset one due vaccination so GET /reminders/send will generate a voice file for testing.
Run from backend dir: python scripts/reset_reminder_for_test.py
Then call: curl http://localhost:8000/reminders/send
"""
from datetime import date, timedelta
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.child_vaccination import ChildVaccination

REMINDABLE_DAYS = 7

def main():
    today = date.today()
    cutoff = today - timedelta(days=REMINDABLE_DAYS)
    db = SessionLocal()
    try:
        # Find one vaccination: due (<= today), remindable (>= cutoff), not completed
        vac = (
            db.query(ChildVaccination)
            .filter(
                ChildVaccination.completed.is_(False),
                ChildVaccination.due_date.isnot(None),
                ChildVaccination.due_date <= today,
                ChildVaccination.due_date >= cutoff,
            )
            .first()
        )
        if not vac:
            print("No due vaccination in remindable window (due_date between today-7 and today).")
            print("Add a child with birthdate in the past so a vaccine is due, then run this again.")
            return 1
        vac.reminder_sent = False
        vac.voice_sent = False
        vac.reminder_audio_path = None
        db.commit()
        print(f"Reset vaccination id={vac.id} ({vac.vaccine_name}, due {vac.due_date}).")
        print("Now run: curl http://localhost:8000/reminders/send")
        print(f"Then play: http://localhost:8000/reminders/audio/{vac.id}")
        return 0
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
