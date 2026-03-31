# Backend

Primary engineering reference for the FastAPI service under `services/api/`.

## 1. Backend folder structure

| Path | Role |
|------|------|
| `app/api/v1/routes/` | FastAPI routers: one module per resource (`health`, `db_check`, `profiles`, `businesses`, `openings`, `reservations`). |
| `app/services/` | Business workflows: `profile_service`, `business_service`, `opening_service`, `booking_service`. |
| `app/models/` | SQLAlchemy ORM models (`Account`, `Profile`, `Business`, `Opening`, `Reservation`, etc.). |
| `app/schemas/` | Pydantic request/response models per domain. |
| `app/db/` | Engine, session factory, registry—database connectivity. |
| `app/core/` | Settings (`config`), security helpers, shared dependencies. |
| `app/workers/` | Background-style jobs (e.g. `reconcile.py` for expiring holds and openings). |

Additional route code exists under `app/api/v1/routes/auth.py` but is **not** mounted on the main `api_router` in `app/api/v1/router.py`; the shipped Beta API uses `X-Account-Id` for protected routes as documented elsewhere.

## 2. What belongs where

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP only: routing, dependency injection, calling one service function, returning a schema. No embedded business rules. |
| **Services** | Workflows and business rules: who may post an opening, when a hold is valid, status transitions, commits. |
| **Models** | SQLAlchemy ORM: columns, relationships, table names. |
| **Schemas** | Pydantic: validate and document JSON bodies and responses. |
| **db** | `SessionLocal`, `get_db`, engine configuration. |
| **Workers** | Periodic or batch cleanup (expire stale holds/openings), callable from cron or a job runner. |

## 3. Current implemented endpoints

All paths are prefixed with `/api/v1` (see `app/main.py`).

**Public (no `X-Account-Id`)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness: `{"status":"ok"}`. |
| GET | `/db-check` | DB connectivity + sample aggregate (`openings_open`). |

**Authenticated (`X-Account-Id` required)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profiles/me` | Current user’s profile. |
| PATCH | `/profiles/me` | Update profile fields. |
| GET | `/businesses/me` | Business owned by the current account (business role). |
| PATCH | `/businesses/me` | Update business fields. |
| GET | `/openings` | List feed (`mine=false`) or my openings (`mine=true`). |
| GET | `/openings/{opening_id}` | Single opening. |
| POST | `/openings` | Create opening (business). |
| PATCH | `/openings/{opening_id}` | Update opening. |
| DELETE | `/openings/{opening_id}` | Cancel opening (soft cancel via service). |
| POST | `/reservations/hold` | Place hold on `opening_id` (client). |
| POST | `/reservations/{reservation_id}/confirm` | Confirm hold. |
| POST | `/reservations/{reservation_id}/cancel` | Cancel; optional `reason` query param. |
| GET | `/reservations/me` | Client’s reservations. |
| GET | `/reservations/business/me` | Business-side reservation list. |

## 4. Current business logic supported

- **Profiles:** Read/update for the authenticated account.
- **Businesses:** Read/update for the vendor account linked to a business row.
- **Openings:** Create, update, cancel, list live feed, list “mine,” single get; expiration of stale listings.
- **Reservations:** Hold, confirm, cancel, list for client and business; stale hold expiration; opening status coordination (`OPEN` / `ON_HOLD` / `BOOKED` / `EXPIRED` as implemented).

## 5. Backend conventions

- **All DB writes go through the service layer** (or dedicated worker code), not ad hoc in routes.
- **Validate before commit:** Check roles, times, and state before persisting.
- **Keep status transitions explicit:** e.g. only certain reservation statuses allow confirm/cancel.
- **Use UTC for “now”** in services (`timezone.utc`) when comparing instants.
- **Do not hardcode secrets:** Use environment variables / settings (`DATABASE_URL`, etc.).

## 6. How to add a new endpoint

1. Add or update **Pydantic schemas** in `app/schemas/`.
2. Add or update a **service function** in the appropriate `app/services/` module.
3. Add a **route** in the right `app/api/v1/routes/*.py` file.
4. **Wire the router** in `app/api/v1/router.py` if you added a new router module.
5. **Test** with curl or open [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI).
