#!/usr/bin/env bash
set -euo pipefail

DB_URL="postgresql://flashslots:flashslots@localhost:12345/flashslots"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Waiting for Postgres to be ready..."
until pg_isready -d "$DB_URL" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying schema..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/infra/db/init/001_schema.sql"

echo "Applying seed..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/infra/db/init/002_seed.sql"

echo "Database initialized successfully."