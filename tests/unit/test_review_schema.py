"""Unit tests for review request schema (maps to reviews model constraints)."""

import pytest
from pydantic import ValidationError

from app.schemas.reviews import ReviewCreate


@pytest.mark.unit
def test_review_create_rejects_rating_below_one():
    """Rating must be >= 1 (matches DB check and API expectations)."""
    with pytest.raises(ValidationError) as exc:
        ReviewCreate(reservation_id=1, rating=0)
    assert "rating" in str(exc.value).lower()


@pytest.mark.unit
def test_review_create_rejects_rating_above_five():
    """Rating must be <= 5 (matches DB check)."""
    with pytest.raises(ValidationError) as exc:
        ReviewCreate(reservation_id=1, rating=6)
    assert "rating" in str(exc.value).lower()


@pytest.mark.unit
def test_review_create_accepts_valid_payload_with_optional_comment():
    """Happy path: valid rating and optional comment serialize as expected."""
    payload = ReviewCreate(reservation_id=42, rating=4, comment="Great cut")
    assert payload.reservation_id == 42
    assert payload.rating == 4
    assert payload.comment == "Great cut"


