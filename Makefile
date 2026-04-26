.PHONY: dev db backend frontend stop setup test

# Run Python test suite (pytest); see tests/README.md
test:
	pytest

# Default command that runs all services concurrently
dev:
	@echo "Starting FlashSlots local environment..."
	@make -j3 db backend frontend

# Start database using Docker Compose
db:
	@echo "Starting Database..."
	docker compose -f infra/docker-compose.yml up -d


# Detect OS and set correct virtualenv activation
backend:
	@echo "Starting Backend..."
	cd services/api && \
	python -m venv .venv || true && \
	if [ -f ".venv/Scripts/python.exe" ]; then \
		.venv/Scripts/python.exe -m pip install -r requirements.txt && \
		.venv/Scripts/python.exe -m uvicorn app.main:app --reload; \
	else \
		.venv/bin/python -m pip install -r requirements.txt && \
		.venv/bin/python -m uvicorn app.main:app --reload; \
	fi

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