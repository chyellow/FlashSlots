"""
Shared pytest fixtures and hooks for FlashSlots.

Add session-scoped DB fixtures, TestClient factories, and auth helpers here
as integration and unit tests are introduced.
"""

from __future__ import annotations

import os

# Allow importing `app` without a real .env (CI and fresh clones).
# setdefault preserves developer overrides when running pytest locally.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://test:test@127.0.0.1:5432/flashslots_test",
)
os.environ.setdefault(
    "SECRET_KEY",
    "pytest-default-secret-key-not-for-production-use-32chars",
)
