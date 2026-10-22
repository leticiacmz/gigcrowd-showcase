#!/usr/bin/env bash
set -euo pipefail

# Read-only authenticated request. Set GIGCROWD_TOKEN yourself using a token
# from an account you control. Never commit or paste a real token into Git.
if [[ -z "${GIGCROWD_TOKEN:-}" ]]; then
  echo "Set GIGCROWD_TOKEN in your shell before running this script." >&2
  exit 1
fi

curl --fail-with-body --show-error --silent \
  https://gigcrowd-api.onrender.com/users/me \
  -H "Authorization: Bearer ${GIGCROWD_TOKEN}" | jq .
