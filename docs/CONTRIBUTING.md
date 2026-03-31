# Contributing

Guidelines to keep the FlashSlots codebase consistent and reviewable.

## 1. Branching

- Use descriptive branch names, e.g. `feature/…`, `fix/…`, `docs/…`.
- Open **pull requests** against the agreed default branch (e.g. `main`).
- PRs should describe **what** changed and **why**, link issues if applicable, and stay focused on one concern when possible.

## 2. Code organization rules

- **Do not put business logic in routes** — routes delegate to `app/services/`.
- **Do not scatter raw API calls** across the frontend without a small shared client layer (`apiFetch`, hooks, or modules) so URLs and headers stay consistent.
- **Keep schema / service / model separation** — Pydantic for HTTP contracts, SQLAlchemy for persistence, services for rules and transactions.

## 3. Commit expectations

- Prefer **small, focused commits** that are easy to revert or bisect.
- Use **clear messages** in the imperative mood (e.g. “Add reservation cancel route” not “Added”).
- Avoid bundling unrelated refactors with feature work unless necessary.

## 4. Testing before merge

- Run **`make dev`** (or at least the services you touched) and confirm nothing regresses.
- Hit **`/api/v1/health`** and **`/api/v1/db-check`** after backend changes.
- For API changes, exercise the affected endpoint via **curl** or **Swagger** (`/docs`).
- If you change CORS or env vars, verify the **browser** can still call the API from the dev frontend origin.

For detailed commands, see [TESTING.md](TESTING.md).
