#!/usr/bin/env bash
set -e
cd services/api
source .venv/bin/activate 2>/dev/null || true
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000