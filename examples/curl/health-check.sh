#!/usr/bin/env bash
set -euo pipefail

# Health fields such as scheduler.next_run_at change over time.
curl --fail-with-body --show-error --silent \
  https://gigcrowd-api.onrender.com/health | jq .
