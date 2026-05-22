#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  local pids
  pids="$(jobs -p)"
  if [ -n "$pids" ]; then
    kill $pids
  fi
}

trap cleanup EXIT

cd "$ROOT_DIR"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/pip install -r backend/requirements.txt

PYTHONPATH=backend .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

cd "$ROOT_DIR/frontend"
npm install
npm run dev -- --host 0.0.0.0
