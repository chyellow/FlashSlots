from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.reservations import HoldRequest, ReservationRead
from app.services.booking_service import (
    place_hold,
    confirm_reservation,
    cancel_reservation,
    list_my_reservations,
    list_business_reservations,
)

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("/hold", response_model=ReservationRead)
def create_hold(
        payload: HoldRequest,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return place_hold(db, account, payload.opening_id)


@router.post("/{reservation_id}/confirm", response_model=ReservationRead)
def confirm(
        reservation_id: int,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return confirm_reservation(db, account, reservation_id)


@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
def cancel(
        reservation_id: int,
        reason: str | None = Query(default=None),
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return cancel_reservation(db, account, reservation_id, reason)


@router.get("/me", response_model=list[ReservationRead])
def my_reservations(
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return list_my_reservations(db, account)


@router.get("/business/me", response_model=list[ReservationRead])
def business_reservations(
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return list_business_reservations(db, account)