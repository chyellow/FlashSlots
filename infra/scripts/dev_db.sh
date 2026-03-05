#!/usr/bin/env bash
set -e
cd infra
docker compose up -d
echo "DB running on localhost:5432"