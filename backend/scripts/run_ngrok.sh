#!/usr/bin/env bash
# Expose local backend on port 8000 via ngrok for Twilio voice (TwiML callback).
# Usage: ./scripts/run_ngrok.sh   (from backend/ directory)
# Then set APP_BASE_URL in .env to the https URL ngrok shows (e.g. https://abc123.ngrok-free.app)
# If ngrok is not in PATH, uses backend/ngrok if present (run from backend/).

PORT="${1:-8000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
NGROK_BIN="$BACKEND_DIR/ngrok"
if [[ -x "$NGROK_BIN" ]]; then
  NGROK="$NGROK_BIN"
elif command -v ngrok >/dev/null 2>&1; then
  NGROK="ngrok"
else
  echo "ngrok not found. Install from https://ngrok.com/download or run from backend/ after placing ngrok binary there."
  exit 1
fi
echo "Starting ngrok tunnel to http://127.0.0.1:${PORT}"
echo "→ Copy the 'Forwarding' https URL into backend/.env as: APP_BASE_URL=https://xxxx.ngrok-free.app"
echo "→ Restart the backend after setting APP_BASE_URL."
echo "→ If you see 'authentication failed', sign up at https://dashboard.ngrok.com/signup and run: $NGROK config add-authtoken YOUR_TOKEN"
echo ""
exec "$NGROK" http "$PORT"
