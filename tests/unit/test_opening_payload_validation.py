"""Unit tests for opening slot validation (same rules as DB and OpeningCreate pipeline)."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.services.opening_service import _validate_opening_payload


@pytest.mark.unit
def test_validate_opening_payload_rejects_when_ends_at_not_after_starts_at():
    """ends_at must be strictly after starts_at (matches opening_service + schema intent)."""
    ref = datetime(2030, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
    with patch("app.services.opening_service._now", return_value=ref):
        with pytest.raises(HTTPException) as exc:
            _validate_opening_payload(
                starts_at=ref + timedelta(hours=2),
                ends_at=ref + timedelta(hours=2),
                listing_expires_at=ref + timedelta(hours=1),
            )
    assert exc.value.status_code == 400
    assert exc.value.detail == "ends_at must be after starts_at"


@pytest.mark.unit
def test_validate_opening_payload_rejects_when_listing_expires_after_starts_at():
    """listing_expires_at must be on or before starts_at (live listing window rule)."""
    ref = datetime(2030, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
    starts = ref + timedelta(hours=3)
    with patch("app.services.opening_service._now", return_value=ref):
        with pytest.raises(HTTPException) as exc:
            _validate_opening_payload(
                starts_at=starts,
                ends_at=starts + timedelta(hours=1),
                listing_expires_at=starts + timedelta(seconds=1),
            )
    assert exc.value.status_code == 400
    assert "listing_expires_at" in exc.value.detail


@pytest.mark.unit
def test_validate_opening_payload_rejects_when_starts_at_not_in_future():
    """starts_at must be strictly after _now() (server-side clock boundary)."""
    ref = datetime(2030, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
    with patch("app.services.opening_service._now", return_value=ref):
        with pytest.raises(HTTPException) as exc:
            _validate_opening_payload(
                starts_at=ref,
                ends_at=ref + timedelta(hours=1),
                listing_expires_at=ref - timedelta(hours=1),
            )
    assert exc.value.status_code == 400
    assert exc.value.detail == "starts_at must be in the future"


@pytest.mark.unit
def test_validate_opening_payload_accepts_valid_slot_window():
    """No exception when all ordering constraints are satisfied."""
    ref = datetime(2030, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
    starts = ref + timedelta(hours=2)
    with patch("app.services.opening_service._now", return_value=ref):
        _validate_opening_payload(
            starts_at=starts,
            ends_at=starts + timedelta(hours=1),
            listing_expires_at=starts - timedelta(minutes=30),
        )
