#!/usr/bin/env bash
# infra/scripts/alpha_local.sh
# Runs the Alpha demo locally:
# - starts Postgres via docker compose
# - applies init SQL (creates minimal tables + seed)
# - starts FastAPI backend
# - starts Vite frontend
#
# Assumes:
# - infra/docker-compose.yml exists with Postgres service
# - infra/db/init.sql exists (creates openings/businesses + seeds 1 opening)
# - services/api/.env exists with DATABASE_URL + CORS_ORIGINS
# - apps/web/.env exists with VITE_API_BASE_URL

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "==> Starting DB (docker compose)..."
cd "$ROOT_DIR/infra"
docker compose up -d

echo "==> Applying DB init script (tables + seed)..."
# Update credentials if you changed them
psql "postgresql://flashslots:flashslots@localhost:5437/flashslots" -f "$ROOT_DIR/infra/db/init.sql"

echo "==> Starting backend (FastAPI)..."
cd "$ROOT_DIR/services/api"
# If you use a venv, activate it here:
# source .venv/bin/activate
# Make sure requirements are installed:
# pip install -r requirements.txt

# Start backend in the background
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "==> Starting frontend (Vite)..."
cd "$ROOT_DIR/apps/web"
npm install
npm run dev &
WEB_PID=$!

echo ""
echo "Alpha demo running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000/api/v1/health"
echo "  DB check: http://localhost:8000/api/v1/db-check"
echo ""
echo "Press CTRL+C to stop."

cleanup() {
  echo "==> Stopping processes..."
  kill "$WEB_PID" "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

wait