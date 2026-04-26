# FlashSlots tests

Top-level layout:

| Directory | Purpose |
|-----------|---------|
| `unit/` | Fast, isolated tests (no live DB unless mocked). |
| `integration/` | Cross-module / HTTP + DB / workflows. |

## Prerequisites

- Python 3.11+ (same as API).
- Recommended: use the API virtualenv (same interpreter as local backend):

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r ../../requirements-dev.txt
cd ../..
```

Alternatively, from the **repository root**, create `.venv` and `pip install -r requirements-dev.txt` there.

## Run

From the repository root (with `pytest.ini` picked up automatically):

```bash
pytest
```

Or use Make:

```bash
make test
```

### Integration tests (PostgreSQL)

Integration tests call the real FastAPI app and a **live PostgreSQL** instance (same stack as production).

1. Start the database: `make db` or `docker compose -f infra/docker-compose.yml up -d`
2. Optionally set `TEST_DATABASE_URL` (defaults to `postgresql+psycopg://flashslots:flashslots@127.0.0.1:5437/flashslots`)
3. Run:

```bash
pytest tests/integration -v -m integration --strict-markers
# or
make integration-test
```

They are marked `@pytest.mark.integration`. If Postgres is unreachable, tests **skip** with a clear reason (`pytest -rs`).

SDS-style scenarios live in [`tests/integration/test_sds_flows.py`](integration/test_sds_flows.py); shared fixtures in [`tests/integration/conftest.py`](integration/conftest.py).

Unit tests live under `tests/unit/`:

| Module | Focus |
|--------|--------|
| `test_auth_schema.py` | `RegisterRequest` / `LoginRequest` validation |
| `test_review_schema.py` | `ReviewCreate` bounds and happy path |
| `test_reservations_schema.py` | `HoldRequest` |
| `test_opening_payload_validation.py` | `_validate_opening_payload` |
| `test_security.py` | Password hashing and JWT round-trip |
| `test_booking_service.py` | `place_hold` / `confirm_reservation` branches (mocked DB) |

Run only unit tests:

```bash
pytest tests/unit -v --strict-markers
```

Tests are marked with `@pytest.mark.unit`. [`conftest.py`](conftest.py) sets safe default `DATABASE_URL` and `SECRET_KEY` via `os.environ.setdefault` so imports work without a local `.env` (override anytime for integration tests).

## Import path

`pytest.ini` sets `pythonpath = services/api` so test modules can use `from app...` the same way the FastAPI app does.
