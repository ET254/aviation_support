#!/usr/bin/env bash
set -euo pipefail

# run_all.sh
# Starts docker-compose (if present), seeds DB (if DATABASE_URL set),
# launches backend and frontend in background and tails logs.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

echo "[run_all] root: $ROOT_DIR"

# Load backend .env if present
if [ -f "$ROOT_DIR/backend/.env" ]; then
  echo "[run_all] Loading backend/.env"
  set -o allexport
  # shellcheck disable=SC1090
  source "$ROOT_DIR/backend/.env"
  set +o allexport
fi

# Optionally start docker-compose (if available)
if command -v docker-compose >/dev/null 2>&1 && [ -f "$ROOT_DIR/docker-compose.yml" ]; then
  echo "[run_all] Starting docker-compose services (detached)"
  docker-compose -f "$ROOT_DIR/docker-compose.yml" up -d
else
  echo "[run_all] docker-compose not available or docker-compose.yml not found — skipping"
fi

# Backend: generate prisma client and seed (if DATABASE_URL present)
if [ -d "$ROOT_DIR/backend" ]; then
  echo "[run_all] Preparing backend"
  (cd "$ROOT_DIR/backend" && echo "[backend] npm install (skipped) -- ensure dependencies are installed")
  if command -v npx >/dev/null 2>&1; then
    (cd "$ROOT_DIR/backend" && npx prisma generate) || true
  fi

  if [ -n "${DATABASE_URL:-}" ]; then
    echo "[run_all] DATABASE_URL detected — running prisma seed"
    (cd "$ROOT_DIR/backend" && npm run prisma:seed) || true
  else
    echo "[run_all] DATABASE_URL not set — skipping seed"
  fi

  echo "[run_all] Starting backend (logs: $LOG_DIR/backend.log)"
  nohup bash -lc "cd '$ROOT_DIR/backend' && npm run dev" > "$LOG_DIR/backend.log" 2>&1 &
else
  echo "[run_all] backend folder not found — skipping backend start"
fi

# Frontend: start dev server
if [ -d "$ROOT_DIR/frontend" ]; then
  echo "[run_all] Starting frontend (logs: $LOG_DIR/frontend.log)"
  nohup bash -lc "cd '$ROOT_DIR/frontend' && npm run dev" > "$LOG_DIR/frontend.log" 2>&1 &
else
  echo "[run_all] frontend folder not found — skipping frontend start"
fi

sleep 1
echo "[run_all] Services launched. Tailing logs. Press Ctrl-C to stop tailing; services will keep running in background."
tail -n +1 -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
