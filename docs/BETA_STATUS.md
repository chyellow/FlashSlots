# Beta status

Team-facing progress tracker for the FlashSlots Beta.

## 1. Beta goals

Target capabilities for Beta:

- **Business posting openings** — create, update, cancel, and list slots.
- **Short hold window** — configurable hold duration (default five minutes via `HOLD_MINUTES`).
- **Appointment-style specs** — start/end, listing expiry, price, payment option, staff/title/description as supported by schema and API.
- **Profiles** — client profile read/update via `/profiles/me`.
- **Archive / history** — list flows and seeded data for booked/completed-style scenarios (full product polish may follow).
- **Expiration support** — stale holds and stale openings expired via service/worker logic.

## 2. Done

- PostgreSQL schema and seed data (`001_schema.sql`, `002_seed.sql`).
- FastAPI routes for health, DB check, profiles, businesses, openings, reservations (see [BACKEND.md](BACKEND.md)).
- Service-layer business logic for openings and booking (hold, confirm, cancel, list).
- Hold expiration and opening expiration helpers (`booking_service`, `opening_service`, `workers/reconcile.py`).
- Local `make dev` workflow (Docker DB + uvicorn + Vite).
- Frontend project structure with Vite; GitHub Pages deploy workflow for static web.
- Backend deploy example on Render; CORS and `DATABASE_URL` configuration.

## 3. In progress

- **End-to-end Beta UX** — wiring every screen to the shipped `/api/v1` contract and `X-Account-Id` dev auth consistently.
- **Worker scheduling** — reconciliation script exists; production scheduling on Render (cron or separate worker) may need explicit setup.
- **Auth alignment** — JWT-oriented code exists under `routes/auth.py` but is **not** mounted on the main router; frontend may still reference `/auth/*` paths in places.

## 4. Not started / later

- Production-grade authentication and authorization (replace header impersonation).
- Email/push **notifications** for holds and confirmations.
- **Reviews** and ratings (tables may exist in broader design; not the Beta focus).
- Payments integration.
- Admin tooling beyond ad hoc SQL/API.

## 5. Known issues / blockers

- **Temporary auth only** — `X-Account-Id` is for development; unsafe for public deployment as-is.
- **Frontend integration incomplete** — some client code may target endpoints not exposed on the current `api_router`.
- **No notifications yet** — users are not alerted out-of-band.
- **No reviews yet** — not part of current Beta delivery.

## 6. Next tasks

- Align frontend API client with mounted routes and shared `VITE_API_BASE_URL`.
- Add `X-Account-Id` (or interim dev toggle) consistently for protected calls during Beta QA.
- Schedule `app/workers/reconcile.py` in staging/production.
- Expand automated tests (API integration tests, smoke scripts).
- Document Render service name, GitHub Pages URL, and required Actions variables for each environment.
