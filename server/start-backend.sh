#!/usr/bin/env bash
set -euo pipefail

SERVER_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$SERVER_ROOT"

if [[ ! -x .venv/bin/python ]]; then
  echo "Virtualenv missing. Run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

export MPLCONFIGDIR="$SERVER_ROOT/.matplotlib"
mkdir -p "$MPLCONFIGDIR"

echo "Starting API on http://127.0.0.1:8000"
exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
