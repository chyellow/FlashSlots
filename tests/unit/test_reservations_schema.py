"""Unit tests for reservation request schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.reservations import HoldRequest


@pytest.mark.unit
def test_hold_request_rejects_non_positive_opening_id():
    """opening_id must be >= 1 (matches BIGSERIAL semantics and API usage)."""
    with pytest.raises(ValidationError) as exc:
        HoldRequest(opening_id=0)
    assert "opening_id" in str(exc.value).lower()
