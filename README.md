# FlashSlots
FlashSlots is a real-time marketplace for “expiring time” that helps service providers, beginning with barbers, recover revenue from last-minute cancellations by instantly advertising newly-open time slots

## Repo Structure

- `apps/web/` — React and Vite frontend (client, vendor, and any admin UIs). Calls the backend API.
- `services/api/` — FastAPI backend (REST endpoints, business logic, and DB access).
    - `app/api/` — route handlers (HTTP endpoints)
    - `app/services/` — core workflows (posting openings, holds/booking, cancellations, notifications)
    - `app/models/` — database models
    - `app/schemas/` — request/response DTOs (API contracts)
    - `app/workers/` — background jobs (expire holds/openings, send notifications)
- `infra/` — local infrastructure (e.g., Docker Compose for the database).
- `docs/` — SDS, diagrams, and project documentation.


## FlashSlots Frontend (Alpha)

This directory contains the React frontend for the FlashSlots alpha release.
The current version is a skeletal implementation that demonstrates the
frontend infrastructure and project setup.

### Prerequisites

You must have the following installed:

- Node.js (v18 or later recommended)
- npm (included with Node.js)
- Git

You can verify your installation by running:

```bash
node -v
npm -v
git -v
```
Once all are installed the following commands can be run

```bash
git clone https://github.com/chyellow/FlashSlots.git
cd FlashSlots/flashslots-frontend

npm install
npm run dev
```
