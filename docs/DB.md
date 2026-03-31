# Database

Schema and workflow for PostgreSQL in FlashSlots.

## 1. DB purpose

The database stores everything needed for accounts, identity-adjacent profile data, vendor businesses, bookable openings, and reservations (holds through completion). It is the **source of truth** for who can post slots, what is available, and what is held or confirmed.

| Domain | Stored data |
|--------|-------------|
| **accounts** | Login identity: email, password hash, role (`CLIENT` / `BUSINESS` / `ADMIN`), status. |
| **profiles** | Human-facing client profile (display name, contact, location, username)—one row per account. |
| **businesses** | Vendor shop: address, geo, timezone, verification and payment defaults—one business per owner account in the current model. |
| **openings** | Time slots for sale: window, price, payment option, listing expiry, lifecycle status. |
| **reservations** | Holds and bookings: links client to opening, status, hold expiry, timestamps for confirm/cancel/complete. |

## 2. Table overview

**accounts**

- Primary key `account_id`; unique `email`; `role` and `status` constrained to allowed values.

**profiles**

- One-to-one with `accounts` via unique `account_id` FK; optional `username` (unique when set).

**businesses**

- Owned by exactly one account (`owner_account_id` unique); location and operational metadata.

**openings**

- Belongs to a `business_id`; tracks `posted_by_account_id`, time window (`starts_at`, `ends_at`), pricing, `listing_expires_at`, and `status` (`OPEN`, `ON_HOLD`, `BOOKED`, `EXPIRED`, `CANCELLED`).

**reservations**

- **At most one reservation per opening** (`opening_id` UNIQUE). Tracks client, status (`HOLD`, `CONFIRMED`, cancellations, `HOLD_EXPIRED`, `COMPLETED`), and timestamps.

## 3. Important constraints

Examples enforced in `infra/db/init/001_schema.sql`:

- **`reservations.opening_id` is UNIQUE** — one booking pipeline per opening.
- **`listing_expires_at <= starts_at`** — listing ends before or when the appointment starts.
- **`ends_at > starts_at`** — valid interval.
- **Status values** — checked via `CHECK` constraints on openings and reservations.
- **HOLD reservations** require `hold_expires_at` when status is `HOLD`.
- **COMPLETED** reservations require `completed_at`.

Application services repeat some checks (e.g. `ends_at` vs `starts_at`) for clear API errors.

## 4. Seed data (`002_seed.sql`)

Inserts **idempotent** demo rows (uses `ON CONFLICT DO NOTHING` / `NOT EXISTS` guards):

- **Test client** — `client@test.com` with profile “Test Client” and username `client`.
- **Test business** — `biz@test.com` with profile “Test Barber” / username `vendor` and business “Test Barber Shop.”
- **Demo openings** — e.g. an `OPEN` “Haircut - Flash Slot,” an `EXPIRED` slot, a `BOOKED` slot, and a completed-history style row.
- **Demo reservations** — e.g. `CONFIRMED` on the booked opening, `COMPLETED` on the completed slot.

Purpose: local and CI smoke tests, demos, and consistent `account_id` values (typically **1** = client, **2** = business after seed order).

## 5. DB lifecycle

1. **Docker** runs Postgres from `infra/docker-compose.yml`, mapping host port **12345** to container 5432.
2. On **first** volume creation, scripts under `infra/db/init/` run in order: **`001_schema.sql`** then **`002_seed.sql`**.
3. **`make dev`** starts the DB container; ensure the backend `DATABASE_URL` points at the same host/port/database/user as Compose (see `/.env.example`).

To reset completely: `make reset-db` (drops volume and recreates—see root `Makefile`).

## 6. Query examples

Using Docker from the repo root (adjust if your Compose project name differs):

```bash
docker compose -f infra/docker-compose.yml exec db \
  psql -U flashslots -d flashslots -c "SELECT COUNT(*) FROM openings;"
```

```bash
docker compose -f infra/docker-compose.yml exec db \
  psql -U flashslots -d flashslots -c "SELECT account_id, email, role FROM accounts ORDER BY account_id;"
```

```bash
docker compose -f infra/docker-compose.yml exec db \
  psql -U flashslots -d flashslots -c "SELECT reservation_id, opening_id, status FROM reservations ORDER BY reservation_id;"
```

Useful checks: count `OPEN` openings; verify seeded emails; inspect reservation statuses after exercising holds.
