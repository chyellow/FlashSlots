"""
Integration test harness: FastAPI TestClient + real PostgreSQL.

Uses dependency override for get_db so each HTTP request gets a fresh Session
from the test engine (same behavior as production session scope per request).

Teardown removes rows created for this test run via deterministic email prefix.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import Generator
from typing import Any

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import get_db
from app.main import app


def _default_test_database_url() -> str:
    """Prefer explicit test URL; else local docker-compose Postgres (port 5437)."""
    return os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://flashslots:flashslots@127.0.0.1:5437/flashslots",
    )


def _purge_accounts_by_email_prefix(engine: Engine, email_prefix: str) -> None:
    """
    Delete integration fixtures in FK-safe order.
    `email_prefix` should be unique per test (e.g. it-sds-abc12-).
    """
    like = f"{email_prefix}%"
    with engine.begin() as conn:
        rows = conn.execute(
            text("SELECT account_id FROM accounts WHERE email LIKE :like"),
            {"like": like},
        ).fetchall()
        ids = [int(r[0]) for r in rows]
        if not ids:
            return
        id_list = ",".join(str(i) for i in ids)

        # Openings CASCADE to reservations; reservations CASCADE to reviews.
        conn.execute(
            text(
                f"""
                DELETE FROM openings
                WHERE business_id IN (
                    SELECT business_id FROM businesses WHERE owner_account_id IN ({id_list})
                )
                   OR posted_by_account_id IN ({id_list})
                """
            )
        )
        conn.execute(text(f"DELETE FROM businesses WHERE owner_account_id IN ({id_list})"))
        conn.execute(text(f"DELETE FROM profiles WHERE account_id IN ({id_list})"))
        conn.execute(text(f"DELETE FROM accounts WHERE account_id IN ({id_list})"))


@pytest.fixture(scope="session")
def integration_engine() -> Generator[Engine, None, None]:
    url = _default_test_database_url()
    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 — surface connection errors clearly
        pytest.skip(f"PostgreSQL not reachable for integration tests ({url}): {exc}")

    yield engine
    engine.dispose()


@pytest.fixture
def it_run_id() -> str:
    """Unique prefix segment for emails / cleanup for this test function."""
    return f"it-sds-{uuid.uuid4().hex[:14]}"


@pytest.fixture
def api_client(integration_engine: Engine, it_run_id: str) -> Generator[Any, None, None]:
    """
    TestClient with get_db overridden to use sessions from the integration engine.
    """
    from fastapi.testclient import TestClient

    SessionLocal = sessionmaker(
        bind=integration_engine,
        autocommit=False,
        autoflush=False,
    )

    def override_get_db() -> Generator[Session, None, None]:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app, raise_server_exceptions=True) as client:
            yield client
    finally:
        app.dependency_overrides.pop(get_db, None)
        _purge_accounts_by_email_prefix(integration_engine, it_run_id)


@pytest.fixture
def it_emails(it_run_id: str) -> dict[str, str]:
    """Deterministic mailbox names per role for one test run.

    Use ``example.org`` (not ``example.test``): Pydantic ``EmailStr`` / email-validator
    rejects ``.test`` as a reserved/special-use domain.
    """
    return {
        "vendor": f"{it_run_id}-vendor@example.org",
        "client_a": f"{it_run_id}-client-a@example.org",
        "client_b": f"{it_run_id}-client-b@example.org",
    }
