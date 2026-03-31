# Architecture

## 1. System overview

FlashSlots follows a classic three-tier shape:

**Browser → React frontend → FastAPI backend → PostgreSQL**

- The **frontend** loads in the user’s browser, calls JSON HTTP APIs, and renders client and vendor flows.
- The **backend** validates requests, applies business rules, reads and writes the database, and returns structured responses (Pydantic schemas).
- The **database** stores accounts, profiles, businesses, openings, and reservations as the source of truth.

**Local vs deployed**

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local dev** | Vite dev server (e.g. port 5173) | Uvicorn (e.g. port 8000) | PostgreSQL in Docker (`infra/docker-compose.yml`) |
| **Production** | Static site on **GitHub Pages** | **Render** web service | **Render** PostgreSQL |

## 2. Component breakdown

**Frontend (`apps/web`)**

- UI for browsing openings, placing holds, confirming/cancelling reservations, and editing profile/business where implemented.
- Uses `VITE_API_BASE_URL` to reach the API; must align with backend `CORS_ORIGINS`.

**Backend (`services/api`)**

- HTTP routes under `/api/v1` delegate to **services** for workflows (openings, booking, profiles, businesses).
- **SQLAlchemy models** map to tables; **Pydantic schemas** define API request/response shapes.
- **Workers** (e.g. `app/workers/reconcile.py`) run expiration jobs (stale holds and openings); they are intended to be invoked on a schedule in production, not on every HTTP request.

**Database**

- Stores relational data with constraints (unique reservation per opening, valid time ranges, status enums).
- Initialized from SQL migrations in `infra/db/init/` when the Docker volume is first created.

**Workers / orchestration**

- Reconciliation logic expires holds past `hold_expires_at` and openings past listing or start time, updating statuses accordingly. Run the worker script or schedule it alongside the web process in deployed environments.

## 3. Deployment model

**Local**

- Frontend: `npm run dev` in `apps/web` (or via `make dev`).
- Backend: `uvicorn app.main:app --reload` in `services/api` (or via `make dev`).
- Postgres: `docker compose -f infra/docker-compose.yml up -d`.

**Production**

- **GitHub Pages:** CI builds `apps/web` with Vite and uploads `dist/`; base path is configured for the repo (see `apps/web/vite.config.js`).
- **Render:** Backend runs as a web service with `DATABASE_URL`, `CORS_ORIGINS`, and related env vars; database is Render Postgres.

Details: [DEPLOYMENT.md](DEPLOYMENT.md).

## 4. Data flows

**Load live openings**

1. Client’s browser requests `GET /api/v1/openings` (with `X-Account-Id`).
2. Backend lists openings in feed-eligible states (e.g. `OPEN`) via the opening service.
3. JSON responses render in the UI.

**Vendor posts an opening**

1. Business user sends `POST /api/v1/openings` with slot details.
2. Service validates times (`ends_at > starts_at`, `listing_expires_at <= starts_at`), associates the opening with the vendor’s business, and persists.

**Client places a hold**

1. Client sends `POST /api/v1/reservations/hold` with `opening_id`.
2. Booking service ensures the account is a client, optionally runs hold expiration, locks the row, creates a `HOLD` reservation, sets `hold_expires_at`, and moves the opening to `ON_HOLD` where applicable.

**Client confirms a reservation**

1. Client sends `POST /api/v1/reservations/{id}/confirm`.
2. Service validates state transitions and sets reservation/opening to confirmed/booked as appropriate.

## 5. Temporary auth model

**Current Beta shortcut:** `X-Account-Id` header

- The dependency `get_current_account` loads an `Account` by primary key from this header.
- **Why it exists:** Unblocks API and UI development without implementing full JWT/session auth in front of every route.
- **Limitation:** Anyone who can reach the API can impersonate an account ID; this is not acceptable for production security.
- **Future:** Replace with real authentication (e.g. signed tokens, sessions) and remove reliance on a raw account header.

## 6. Important architectural conventions

- **Routes are thin:** Parse HTTP, call services, return schemas—minimal logic in route handlers.
- **Service layer owns business logic:** Validation, state transitions, and commits happen in services.
- **Models map to DB tables:** SQLAlchemy models reflect `001_schema.sql` (and evolve together).
- **Schemas define API contracts:** Pydantic models in `app/schemas/` are the public request/response shapes.

See [BACKEND.md](BACKEND.md) for folder layout and endpoint details.
