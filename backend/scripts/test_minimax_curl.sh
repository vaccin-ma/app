#!/usr/bin/env bash
# Test Minimax API with curl. Loads MINIMAX_API_KEY and MINIMAX_BASE_URL from backend/.env
# Run from backend:  bash scripts/test_minimax_curl.sh
#
# If you get 1004 (auth fail), test with key pasted manually:
#   curl -s -X POST "https://api.minimax.io/v1/text/chatcompletion_v2" \
#     -H "Authorization: Bearer YOUR_KEY_HERE" \
#     -H "Content-Type: application/json" \
#     -d '{"model":"M2-her","messages":[{"role":"user","content":"Say hello in Arabic in one sentence."}]}' | python3 -m json.tool

set -e
cd "$(dirname "$0")/.."
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

# Trim possible newline from .env
MINIMAX_API_KEY="${MINIMAX_API_KEY%$'\r'}"
MINIMAX_API_KEY="${MINIMAX_API_KEY//$'\n'/}"

if [[ -z "${MINIMAX_API_KEY}" ]]; then
  echo "MINIMAX_API_KEY not set. Add it to backend/.env or export it."
  exit 1
fi
export MINIMAX_API_KEY
echo "MINIMAX_API_KEY length: ${#MINIMAX_API_KEY}"

URL="${MINIMAX_BASE_URL:-https://api.minimax.io}/v1/text/chatcompletion_v2"
echo "POST $URL"
echo ""

# Use MiniMax-M2.5 (works with Coding Plan); M2-her is Pay-as-you-go only
curl -s -X POST "$URL" \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-M2.5",
    "messages": [
      {"role": "system", "name": "MiniMax AI", "content": "You write very short reminders in Arabic Fusha for parents about child vaccines."},
      {"role": "user", "name": "User", "content": "Say hello in one short Arabic sentence."}
    ]
  }' | python3 -m json.tool
