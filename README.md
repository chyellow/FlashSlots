# FlashSlots

## Project overview

**FlashSlots** is a real-time marketplace for expiring appointment time: service providers (starting with barbers) can advertise last-minute openings when clients cancel, and clients can discover, hold, and confirm those slots.

**Product summary:** The app connects a web frontend to a FastAPI backend and PostgreSQL database so businesses post openings with pricing and timing, clients browse a live feed, place a short-lived hold on a slot, and confirm or cancel reservations—while background logic expires stale holds and listings that are no longer valid.

**Release status:** Alpha is complete. **Beta is in progress.**

**What Beta currently supports:** Business posting and managing openings; client holds using a configurable hold window (default five minutes); reservation confirm/cancel flows; profile and business records; listing and hold expiration; history-oriented data via seeded demo openings and reservations. Authentication for API access is a temporary header-based model (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)); full login/token auth is planned later.

## Repo structure

| Path | Purpose |
|------|---------|
| [`apps/web/`](apps/web/) | React + Vite frontend (client/vendor UI). Talks to the backend over HTTP. |
| [`services/api/`](services/api/) | FastAPI REST API: routes, services, models, schemas, DB session, workers. |
| [`infra/`](infra/) | Local infrastructure—Docker Compose for PostgreSQL and init SQL under `infra/db/init/`. |
| [`docs/`](docs/) | Architecture, backend, database, deployment, testing, and team docs. |

## Architecture at a glance

> **Note:** The database runs on port `5432` on your host machine (mapped from container port 5432). If you need to change this, update the `ports` field in `infra/docker-compose.yml` and the `DATABASE_URL` in `services/api/.env` accordingly.

## Quick start

**Prerequisites:** Node.js (18+ recommended), npm, Python 3.11+, Docker Desktop (or compatible Docker engine), Git.

From the repository root:

```bash
make dev
```

This runs the database, backend, and frontend concurrently (`make -j3 db backend frontend`).

| What | Where |
|------|--------|
| Frontend dev server | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Interactive API docs (Swagger UI) | [http://localhost:8000/docs](http://localhost:8000/docs) |

Ensure Docker is running before `make dev` so the database container can start.

## Environment variables

Do not commit real secrets. Use local `.env` files or your host’s secret manager.

**Frontend (`apps/web`, build-time for Vite):**

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Base URL for API calls, including `/api/v1` path (e.g. `http://localhost:8000/api/v1` locally, or your deployed API base in production). |

**Backend (`services/api`, from `.env` or environment):**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLAlchemy/Postgres connection string for the app database. |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins (e.g. `http://localhost:5173`). |
| `HOLD_MINUTES` | How long a hold remains valid before expiration logic applies (integer; default in code is 5 if unset). |

Copy [`/.env.example`](.env.example) to `services/api/.env` when bootstrapping (the Makefile does this if missing).

## How to test the app quickly

1. **Health (no auth):** `GET /api/v1/health` → `{"status":"ok"}`.
2. **Database check (no auth):** `GET /api/v1/db-check` → server time and count of `OPEN` openings.

**Temporary auth:** Most business and client routes expect:

- `X-Account-Id: 1` — seeded **client** account (`client@test.com` in seed data).
- `X-Account-Id: 2` — seeded **business** account (`biz@test.com`).

See [docs/TESTING.md](docs/TESTING.md) for curl examples.

## Links to deeper documentation

| Document | Contents |
|----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System overview, components, deployment, data flows, temporary auth, conventions. |
| [docs/BACKEND.md](docs/BACKEND.md) | Backend layout, layers, endpoints, business logic, conventions, adding endpoints. |
| [docs/DB.md](docs/DB.md) | Schema, constraints, seed data, lifecycle, query examples. |
| [docs/BETA_STATUS.md](docs/BETA_STATUS.md) | Beta goals, done/in progress/deferred, issues, next tasks. |
| [docs/TESTING.md](docs/TESTING.md) | Local boot, smoke tests, curl examples, auth header, common failures. |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub Pages, Render backend/Postgres, env vars, verification. |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branching, code organization, commits, pre-merge checks. |
