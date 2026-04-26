"""Unit tests for auth request schemas (registration maps to accounts/profiles)."""

import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest, RegisterRequest


@pytest.mark.unit
def test_register_request_rejects_password_shorter_than_eight_chars():
    """Password min length 8 aligns with auth_service / security expectations."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            email="user@example.com",
            password="short",
            role="CLIENT",
            display_name="Valid Name",
        )
    assert "password" in str(exc.value).lower()


@pytest.mark.unit
def test_register_request_rejects_empty_display_name():
    """Display name is required and non-empty for profile creation."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            email="user@example.com",
            password="longenough",
            role="CLIENT",
            display_name="",
        )
    assert "display_name" in str(exc.value).lower()


@pytest.mark.unit
def test_register_request_rejects_invalid_role_literal():
    """Only CLIENT and BUSINESS may register (matches accounts.role check constraint)."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            email="user@example.com",
            password="longenough",
            role="ADMIN",
            display_name="Valid Name",
        )
    assert "role" in str(exc.value).lower()


@pytest.mark.unit
def test_register_request_rejects_invalid_default_payment_option():
    """default_payment_option must be CARD, CASH, or BOTH when provided."""
    with pytest.raises(ValidationError) as exc:
        RegisterRequest(
            email="user@example.com",
            password="longenough",
            role="BUSINESS",
            display_name="Valid Name",
            default_payment_option="WIRE",
        )
    assert "default_payment_option" in str(exc.value).lower()


@pytest.mark.unit
def test_login_request_rejects_invalid_email_format():
    """EmailStr rejects malformed addresses before auth_service runs."""
    with pytest.raises(ValidationError) as exc:
        LoginRequest(email="not-a-valid-email", password="anypassword")
    assert "email" in str(exc.value).lower()
