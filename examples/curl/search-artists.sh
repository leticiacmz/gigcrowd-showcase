#!/usr/bin/env bash
set -euo pipefail

API_BASE="https://gigcrowd-api.onrender.com"

# Unified search is documented as read-only: it does not import, follow,
# or synchronize artists. Do not replace this with an artist profile read
# for an artist whose initialization state has not been checked.
echo "=== Live search: Charli XCX ==="
curl --fail-with-body --show-error --silent --get \
  --data-urlencode "q=Charli XCX" \
  --data-urlencode "limit=20" \
  "${API_BASE}/search" | jq .
