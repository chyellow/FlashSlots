#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Starting Postgres with Docker Compose..."
cd "$ROOT_DIR/infra"
docker compose up -d

"$ROOT_DIR/infra/scripts/db_init.sh"