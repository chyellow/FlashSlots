"""Unit tests for booking_service branches (mocked Session, no real DB)."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.models import Account, Reservation
from app.services import booking_service


@pytest.fixture
def patch_expire_stale_holds():
    """Avoid touching query chains on a MagicMock when expire_stale_holds runs."""
    with patch.object(booking_service, "expire_stale_holds", autospec=True):
        yield


@pytest.mark.unit
def test_place_hold_forbids_non_client_account(patch_expire_stale_holds):
    """Only CLIENT role may place a hold (403 before any opening lookup)."""
    db = MagicMock()
    account = MagicMock(spec=Account)
    account.role = "BUSINESS"

    with pytest.raises(HTTPException) as exc:
        booking_service.place_hold(db, account, opening_id=1)

    assert exc.value.status_code == 403
    assert "Client" in exc.value.detail
    db.query.assert_not_called()


@pytest.mark.unit
def test_place_hold_returns_404_when_opening_missing(patch_expire_stale_holds):
    """Missing opening_id yields 404 after SELECT ... FOR UPDATE."""
    db = MagicMock()
    account = MagicMock(spec=Account)
    account.role = "CLIENT"
    account.account_id = 1

    chain = MagicMock()
    chain.filter.return_value = chain
    chain.with_for_update.return_value = chain
    chain.first.return_value = None
    db.query.return_value = chain

    with pytest.raises(HTTPException) as exc:
        booking_service.place_hold(db, account, opening_id=999)

    assert exc.value.status_code == 404
    assert exc.value.detail == "Opening not found"


@pytest.mark.unit
def test_confirm_reservation_rejects_when_not_in_hold_state(patch_expire_stale_holds):
    """Only HOLD reservations may be confirmed (409 conflict)."""
    db = MagicMock()
    account = MagicMock(spec=Account)
    account.role = "CLIENT"
    account.account_id = 7

    reservation = MagicMock(spec=Reservation)
    reservation.reservation_id = 50
    reservation.client_account_id = 7
    reservation.opening_id = 3
    reservation.status = "CONFIRMED"
    reservation.hold_expires_at = None

    res_chain = MagicMock()
    res_chain.filter.return_value = res_chain
    res_chain.with_for_update.return_value = res_chain
    res_chain.first.return_value = reservation
    db.query.return_value = res_chain
    db.get.return_value = None

    with pytest.raises(HTTPException) as exc:
        booking_service.confirm_reservation(db, account, reservation_id=50)

    assert exc.value.status_code == 409
    assert "HOLD" in exc.value.detail


@pytest.mark.unit
def test_complete_reservation_allows_client_owner():
    """Client who owns the reservation may mark a confirmed appointment complete."""
    db = MagicMock()
    account = MagicMock(spec=Account)
    account.account_id = 7

    reservation = MagicMock(spec=Reservation)
    reservation.reservation_id = 50
    reservation.client_account_id = 7
    reservation.opening_id = 3
    reservation.status = "CONFIRMED"

    opening = MagicMock()
    opening.business_id = 14
    opening.status = "BOOKED"
    opening.version = 2

    res_chain = MagicMock()
    res_chain.filter.return_value = res_chain
    res_chain.with_for_update.return_value = res_chain
    res_chain.first.return_value = reservation
    db.query.return_value = res_chain
    db.get.return_value = opening

    with patch.object(booking_service, "_get_vendor_business", return_value=None):
        result = booking_service.complete_reservation(db, account, reservation_id=50)

    assert result is reservation
    assert reservation.status == "COMPLETED"
    assert reservation.completed_at is not None
    assert opening.status == "COMPLETED"
    assert opening.version == 3
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(reservation)


@pytest.mark.unit
def test_complete_reservation_forbids_unrelated_account():
    """Unrelated accounts may not complete another client's reservation."""
    db = MagicMock()
    account = MagicMock(spec=Account)
    account.account_id = 99

    reservation = MagicMock(spec=Reservation)
    reservation.reservation_id = 50
    reservation.client_account_id = 7
    reservation.opening_id = 3
    reservation.status = "CONFIRMED"

    opening = MagicMock()
    opening.business_id = 14

    res_chain = MagicMock()
    res_chain.filter.return_value = res_chain
    res_chain.with_for_update.return_value = res_chain
    res_chain.first.return_value = reservation
    db.query.return_value = res_chain
    db.get.return_value = opening

    with patch.object(booking_service, "_get_vendor_business", return_value=None):
        with pytest.raises(HTTPException) as exc:
            booking_service.complete_reservation(db, account, reservation_id=50)

    assert exc.value.status_code == 403
    assert "client or vendor" in exc.value.detail
