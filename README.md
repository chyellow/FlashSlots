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
- Python 3.11+ (for backend development)
- Docker (for local infrastructure)
- PgAdmin (optional, for database management)

You can verify your installation by running:

```bash
node -v
npm -v
git -v
```

## Setup Guide
The first step is to stand up the local infrastructure supported by Docker Compose and PostgreSQL.

The following command starts the DB and any other necessary services defined in `infra/docker-compose.yml`:
```bash
docker compose -f infra/docker-compose.yml up -d
```

Confirm that the PostgreSQL container is running and accessible:
```bash
docker ps
```

See the tables and schemas loaded in from when you stood up this infrastructure:
```bash
docker exec -it infra-db-1 psql -U flashslots -d flashslots -c "\dt"
```

If you do not see any tables or schemas, reset volumes so init scripts can run again:
```bash
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d
docker exec -it infra-db-1 psql -U flashslots -d flashslots -c "\dt"
```

Alternatively, instead of taking the last two steps, you can use PgAdmin to connect to the database
by using the credentials found in docker-compose.yml 

# PLACEHOLDER: Set up backend environment and install any necessary dependencies (e.g., Python packages, environment variables).

> **Note:** The database runs on port `12345` on your host machine (mapped from container port 5432). If you need to change this, update the `ports` field in `infra/docker-compose.yml` and the `DATABASE_URL` in `services/api/.env` accordingly.

---

### Step 3: Set Up the Backend

Navigate to the API directory:

```bash
cd services/api
```

Create and activate a Python virtual environment:

```bash
# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the `.env` file from the example:

```bash
cp ../../.env.example .env
```

Open `services/api/.env` and confirm it contains:

```
DATABASE_URL=postgresql+psycopg://flashslots:flashslots@127.0.0.1:12345/flashslots
CORS_ORIGINS=http://localhost:5173
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Verify it's running:

```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok"}
```

Test the profiles endpoint:

```bash
curl http://localhost:8000/api/v1/profiles/client
# Expected: {"profile_id":1,"display_name":"Test Client",...}
```

---

### Frontend Setup


Navigate to the web directory:

```bash
cd /apps/web
```

Install dependencies 

```bash
npm i
```

Start the frontend server:

```bash
npm run dev
```

Now you can open `http://localhost:5173/` in the broswer of choice

---

## Models Implementation

Implemented the core SQLAlchemy models based on the provided database schema for the alpha release.

Each model’s attributes were aligned with the columns defined in the schema to ensure consistency with the existing database structure.

Relationships were created to reflect the multiplicity between entities (one-to-one, one-to-manw) and allows SQLAlchemy to properly map associations between accounts, profiles, businesses, openings, reservations, reviews, and notifications.

The relationships help simplify querying related data and allow the application logic to easily navigate between connected records in the database.

The SQLAlchemy `Base` declarative class was configured so that all models inherit from the same metadata base.

# PLACEHOLDER: Any FastAPI specific set up steps (e.g., running migrations, starting the server).

# PLACEHOLDER: Final version of setting up the frontend environment and installing the frontend dependencies

# NOTE: Documentation of your individual steps are required. The final iteration of this project will include a Makefile that aggregates all steps to achieve maximum efficiency (and grade)




## DEPRECATED:
Once all are installed the following commands can be run

```bash
git clone https://github.com/chyellow/FlashSlots.git
cd FlashSlots/flashslots-frontend

npm install
npm run dev
```
