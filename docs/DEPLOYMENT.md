# Deployment

How the live (or staging) FlashSlots stack is hosted.

## 1. Frontend deployment (GitHub Pages)

- **Build:** GitHub Actions runs `npm ci` and `npm run build` in `apps/web` (see `.github/workflows/deploy-pages.yml`).
- **Vite:** Production assets are emitted to `apps/web/dist`.
- **Base path:** `apps/web/vite.config.js` sets `base: "/FlashSlots/"` so the app resolves assets under the GitHub Pages project path. Change this if the repository or Pages URL layout changes.
- **API URL at build time:** Set the Actions variable `VITE_API_BASE_URL` to your backend base including `/api/v1` (e.g. `https://flashslots.onrender.com/api/v1`). The workflow passes it into `npm run build`.

After deployment, the site URL follows the GitHub Pages pattern for your org and repo (often `https://<org>.github.io/FlashSlots/`).

## 2. Backend deployment (Render)

- **Platform:** Render web service running the FastAPI app.
- **Start command:** Typically `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `services/api` (confirm in your Render dashboard).
- **Environment variables:** At minimum `DATABASE_URL` and `CORS_ORIGINS` matching the GitHub Pages origin (and any other dev origins you allow). Optional: `HOLD_MINUTES`.

Example public API base used in this repo’s notes: `https://flashslots.onrender.com` (health: `https://flashslots.onrender.com/api/v1/health`).

## 3. Database deployment (Render Postgres)

- **Managed PostgreSQL** on Render (or equivalent) provides `DATABASE_URL` to the web service.
- **Backend connects** via SQLAlchemy using that URL in `app/core/config.py`—no hardcoded credentials in code.

## 4. Required production env vars (names only)

| Variable | Where |
|----------|--------|
| `DATABASE_URL` | Render web service (and anywhere the API runs). |
| `CORS_ORIGINS` | Render web service (comma-separated origins). |
| `VITE_API_BASE_URL` | GitHub Actions variable for the **frontend build** (full API base path). |

Do not commit secret values to the repository.

## 5. Deploy verification

1. **Live frontend** — Open the GitHub Pages URL; confirm static assets load (no 404 on JS/CSS under the correct base path).
2. **Health** — `GET https://<your-backend-host>/api/v1/health` returns `{"status":"ok"}`.
3. **DB check** — `GET https://<your-backend-host>/api/v1/db-check` returns `db_time` and `openings_open` without error.

If the SPA routes break on refresh, ensure `404.html` is copied from `index.html` in the workflow (already done in `deploy-pages.yml` for client-side routing).
