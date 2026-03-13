.PHONY: dev db backend frontend stop setup

# Default command that runs all services concurrently
dev:
	@echo "Starting FlashSlots local environment..."
	@make -j3 db backend frontend

# Start database using Docker Compose
db:
	@echo "Starting Database..."
	docker compose -f infra/docker-compose.yml up -d

# Setup/start FastAPI backend
backend:
	@echo "Starting Backend..."
	@cd services/api && \
	if [ ! -d ".venv" ]; then python3 -m venv .venv; fi && \
	. .venv/bin/activate && \
	pip install -r requirements.txt && \
	if [ ! -f ".env" ]; then cp ../../.env.example .env; fi && \
	uvicorn app.main:app --reload

# Setup/start the React frontend
frontend:
	@echo "Starting Frontend..."
	@cd apps/web && \
	npm install && \
	npm run dev

# Stop the Docker database container
stop:
	@echo "Stopping Database..."
	docker compose -f infra/docker-compose.yml down

# Reset the database volume
reset-db:
	@echo "Resetting Database..."
	docker compose -f infra/docker-compose.yml down -v
	docker compose -f infra/docker-compose.yml up -d