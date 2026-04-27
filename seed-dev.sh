#!/usr/bin/env bash
# seed-dev.sh — Copies production Upstash data into dev- prefixed keys.
# Safe to re-run; overwrites dev data with current prod data.
set -euo pipefail

source .env

KEYS=("workout-sessions" "workout-custom-exercises" "workout-plans")

for KEY in "${KEYS[@]}"; do
  echo -n "Copying $KEY → dev-$KEY ... "

  VALUE=$(curl -sf "${VITE_UPSTASH_URL}/get/${KEY}" \
    -H "Authorization: Bearer ${VITE_UPSTASH_TOKEN}" | jq -r '.result')

  if [ "$VALUE" = "null" ] || [ -z "$VALUE" ]; then
    echo "empty, skipping"
    continue
  fi

  # Use the pipeline API with jq to safely handle JSON escaping
  PAYLOAD=$(jq -cn --arg key "dev-${KEY}" --arg val "$VALUE" '[["SET", $key, $val]]')

  curl -sf "${VITE_UPSTASH_URL}/pipeline" \
    -H "Authorization: Bearer ${VITE_UPSTASH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" > /dev/null

  echo "done"
done

echo ""
echo "Dev data is ready. Run: npm run dev"
