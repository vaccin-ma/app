# jelba.ma – Vaccine reminders for parents

## Testing voice (voix) reminders

1. **Start the backend** (from `backend/`):  
   `uvicorn app.main:app --reload`

2. **Generate voice files**  
   Call the reminder endpoint (no auth):
   ```bash
   curl "http://localhost:8000/reminders/send"
   ```
   Only vaccinations that are **due** (due_date ≤ today), **remindable** (due within last 7 days), and **not yet sent** get a voice file. Response: `reminders_sent`, `reminders` (with `audio_url`).

3. **If you get `reminders_sent: 0`** (e.g. all already sent or none due in window):
   ```bash
   cd backend
   python scripts/reset_reminder_for_test.py
   ```
   This resets one due vaccination so the next `/reminders/send` will process it. Then run step 2 again.

4. **Where voice is saved**  
   Files: `backend/media/reminders/vac_<id>_<YYYYMMDD>.mp3`  
   Play in browser: `http://localhost:8000/reminders/audio/<vaccination_id>`

5. **Required for voice**  
   In `backend/.env`: `ELEVENLABS_API_KEY` set and `REMINDER_SEND_VOICE=true`.
