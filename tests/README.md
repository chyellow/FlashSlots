# FlashSlots tests

Top-level layout:

| Directory | Purpose |
|-----------|---------|
| `unit/` | Fast, isolated tests (no live DB unless mocked). |
| `integration/` | Cross-module / HTTP + DB / workflows. |

## Prerequisites

- Python 3.11+ (same as API).
- From the **repository root**, create a virtualenv and install dev dependencies (includes API runtime deps):

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
```

## Run

From the repository root (with `pytest.ini` picked up automatically):

```bash
pytest
```

Or use Make:

```bash
make test
```

Until test modules are added, pytest may exit with code **5** (no tests collected); that is expected.

## Import path

`pytest.ini` sets `pythonpath = services/api` so test modules can use `from app...` the same way the FastAPI app does.
