# Testing

How to run and manually verify FlashSlots locally.

## 1. How to boot locally

From the repository root (Docker running):

```bash
make dev
```

**Service URLs**

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend | [http://localhost:8000](http://localhost:8000) |
| Swagger UI | [http://localhost:8000/docs](http://localhost:8000/docs) |

## 2. Smoke tests

1. **Health:** `curl -s http://localhost:8000/api/v1/health` → `{"status":"ok"}`.
2. **DB check:** `curl -s http://localhost:8000/api/v1/db-check` → JSON with `db_time` and `openings_open`.
3. **Frontend loads** — open the dev URL; confirm the app shell renders without console network errors to the API base you configured.
4. **Profile (authenticated):** `curl -s -H "X-Account-Id: 1" http://localhost:8000/api/v1/profiles/me` → profile JSON for the seeded client.

## 3. API testing examples

Set `API=http://localhost:8000/api/v1` and use ISO 8601 datetimes for writes (future times for new openings).

**Profile read / update**

```bash
curl -s -H "X-Account-Id: 1" "$API/profiles/me"
curl -s -H "X-Account-Id: 1" -X PATCH "$API/profiles/me" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Test Client","city":"Piscataway"}'
```

**Business read / update**

```bash
curl -s -H "X-Account-Id: 2" "$API/businesses/me"
curl -s -H "X-Account-Id: 2" -X PATCH "$API/businesses/me" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Test Barber Shop"}'
```

**Opening create / list**

```bash
curl -s -H "X-Account-Id: 2" "$API/openings?mine=true"
curl -s -H "X-Account-Id: 2" -X POST "$API/openings" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Demo slot",
    "starts_at":"2030-01-15T18:00:00Z",
    "ends_at":"2030-01-15T18:30:00Z",
    "listed_price":"35.00",
    "payment_option":"BOTH",
    "listing_expires_at":"2030-01-15T17:00:00Z"
  }'
curl -s -H "X-Account-Id: 1" "$API/openings"
```

**Hold / confirm / cancel**

Replace `OPENING_ID` and `RESERVATION_ID` with real IDs from list responses.

```bash
curl -s -H "X-Account-Id: 1" -X POST "$API/reservations/hold" \
  -H "Content-Type: application/json" \
  -d '{"opening_id":OPENING_ID}'

curl -s -H "X-Account-Id: 1" -X POST "$API/reservations/RESERVATION_ID/confirm"

curl -s -H "X-Account-Id: 1" -X POST "$API/reservations/RESERVATION_ID/cancel"
```

## 4. Auth header for dev

| Header | Typical seeded account |
|--------|-------------------------|
| `X-Account-Id: 1` | Client (`client@test.com`) |
| `X-Account-Id: 2` | Business (`biz@test.com`) |

Missing or invalid header returns `401` for routes that use `get_current_account`.

## 5. Common failure points

- **Docker not running** — DB container fails to start; `db-check` errors or connection refused on `DATABASE_URL`.
- **DB volume stale or wrong state** — use `make reset-db` if init scripts did not apply (only when you can afford data loss).
- **Missing env vars** — backend exits or errors if `DATABASE_URL` is unset/wrong.
- **CORS issues** — browser blocks responses if the frontend origin is not listed in `CORS_ORIGINS` (comma-separated, no spaces unless each origin is trimmed by the app).
