"""Unit tests for JWT and password helpers (app.core.security)."""

from unittest.mock import MagicMock, patch

import pytest

from app.core import security


@pytest.mark.unit
def test_hash_password_and_verify_password_round_trip():
    """Bcrypt hash produced by the app must verify with the same plaintext."""
    plain = "a-secure-passphrase-9"
    hashed = security.hash_password(plain)
    assert hashed != plain
    assert security.verify_password(plain, hashed) is True


@pytest.mark.unit
def test_verify_password_rejects_incorrect_plaintext():
    """Wrong password must never verify against a valid hash."""
    hashed = security.hash_password("correct-horse-battery-staple")
    assert security.verify_password("wrong-password", hashed) is False


@pytest.mark.unit
def test_verify_password_returns_false_for_non_bcrypt_seed_hash():
    """Legacy / seed hashes (e.g. plain devhash) must not verify as bcrypt."""
    assert security.verify_password("any-password", "devhash") is False


@pytest.mark.unit
def test_create_and_decode_access_token_round_trip():
    """JWT payload sub and role survive encode/decode with configured algorithm."""
    fake_settings = MagicMock()
    fake_settings.secret_key = "unit-test-jwt-secret-at-least-32-chars-long!!"
    fake_settings.jwt_algorithm = "HS256"
    fake_settings.access_token_expire_minutes = 60
    with patch.object(security, "settings", fake_settings):
        token = security.create_access_token("99", "CLIENT")
        payload = security.decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "99"
    assert payload["role"] == "CLIENT"
    assert "exp" in payload
