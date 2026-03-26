#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "=== Starting database ==="
"$ROOT_DIR/infra/scripts/dev_db.sh"

echo "=== Starting backend ==="
"$ROOT_DIR/infra/scripts/dev_api.sh" &
API_PID=$!

echo "=== Starting frontend ==="
cleanup() {
  echo ""
  echo "Stopping backend..."
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

"$ROOT_DIR/infra/scripts/dev_web.sh"