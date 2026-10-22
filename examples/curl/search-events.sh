#!/usr/bin/env bash
set -euo pipefail

API_BASE="https://gigcrowd-api.onrender.com"

# Event catalogue search is read-only. A festival edition is identified by
# a non-null `festival` object in the returned event row, not by its title.
echo "=== Events related to Charli XCX ==="
curl --fail-with-body --show-error --silent --get \
  --data-urlencode "q=Charli XCX" \
  --data-urlencode "include_past=true" \
  --data-urlencode "limit=50" \
  "${API_BASE}/events" | jq .

echo "=== Festival catalogue search ==="
curl --fail-with-body --show-error --silent --get \
  --data-urlencode "q=festival" \
  --data-urlencode "include_past=true" \
  --data-urlencode "limit=50" \
  "${API_BASE}/events" | jq .
