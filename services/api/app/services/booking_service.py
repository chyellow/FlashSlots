from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.models import Reservation, Opening, Account, Business


def _now() -> datetime:
    return datetime.now(timezone.utc)


def expire_stale_holds(db: Session) -> None:
    now = _now()

    stale_holds = (
        db.query(Reservation)
        .filter(
            Reservation.status == "HOLD",
            Reservation.hold_expires_at.is_not(None),
            Reservation.hold_expires_at <= now,
            )
        .all()
    )

    changed = False

    for reservation in stale_holds:
        opening = db.get(Opening, reservation.opening_id)

        reservation.status = "HOLD_EXPIRED"

        if opening:
            if (
                    opening.listing_expires_at > now
                    and opening.starts_at > now
                    and opening.status == "ON_HOLD"
            ):
                opening.status = "OPEN"
            elif opening.status == "ON_HOLD":
                opening.status = "EXPIRED"

            opening.version += 1

        changed = True

    if changed:
        db.commit()


def _get_vendor_business(db: Session, account: Account) -> Business | None:
    return db.query(Business).filter(
        Business.owner_account_id == account.account_id
    ).first()


def place_hold(db: Session, account: Account, opening_id: int) -> Reservation:
    if account.role != "CLIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client account required",
        )

    expire_stale_holds(db)

    opening = (
        db.query(Opening)
        .filter(Opening.opening_id == opening_id)
        .with_for_update()
        .first()
    )

    if not opening:
        raise HTTPException(status_code=404, detail="Opening not found")

    now = _now()

    db.refresh(opening)
    if opening.status != "OPEN":
        raise HTTPException(status_code=409, detail="Opening is not available")

    if opening.listing_expires_at <= now or opening.starts_at <= now:
        opening.status = "EXPIRED"
        opening.version += 1
        db.commit()
        raise HTTPException(status_code=409, detail="Opening has expired")

    reservation = Reservation(
        opening_id=opening.opening_id,
        client_account_id=account.account_id,
        status="HOLD",
        hold_expires_at=now + timedelta(minutes=settings.hold_minutes),
    )

    opening.status = "ON_HOLD"
    opening.version += 1

    db.add(reservation)
    db.add(opening)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Opening already reserved")

    db.refresh(reservation)
    return reservation


def confirm_reservation(db: Session, account: Account, reservation_id: int) -> Reservation:
    if account.role != "CLIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client account required",
        )

    expire_stale_holds(db)

    reservation = (
        db.query(Reservation)
        .filter(Reservation.reservation_id == reservation_id)
        .with_for_update()
        .first()
    )

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.client_account_id != account.account_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    opening = db.get(Opening, reservation.opening_id)
    now = _now()

    if reservation.status != "HOLD":
        raise HTTPException(status_code=409, detail="Reservation is not in HOLD state")

    if reservation.hold_expires_at and reservation.hold_expires_at <= now:
        raise HTTPException(status_code=409, detail="Hold has expired")

    reservation.status = "CONFIRMED"
    reservation.confirmed_at = now

    if opening:
        opening.status = "BOOKED"
        opening.version += 1

    db.add(reservation)
    if opening:
        db.add(opening)

    db.commit()
    db.refresh(reservation)
    return reservation


def cancel_reservation(
        db: Session,
        account: Account,
        reservation_id: int,
        reason: str | None = None,
) -> Reservation:
    reservation = (
        db.query(Reservation)
        .filter(Reservation.reservation_id == reservation_id)
        .with_for_update()
        .first()
    )

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    opening = db.get(Opening, reservation.opening_id)
    now = _now()

    is_client = reservation.client_account_id == account.account_id
    business = _get_vendor_business(db, account)
    is_vendor = business is not None and opening is not None and opening.business_id == business.business_id

    if not is_client and not is_vendor:
        raise HTTPException(status_code=403, detail="Forbidden")

    if reservation.status in (
            "CANCELLED_BY_CLIENT",
            "CANCELLED_BY_BUSINESS",
            "HOLD_EXPIRED",
            "COMPLETED",
    ):
        raise HTTPException(status_code=409, detail="Reservation is already final")

    reservation.status = "CANCELLED_BY_CLIENT" if is_client else "CANCELLED_BY_BUSINESS"
    reservation.cancelled_at = now
    reservation.cancelled_by_account_id = account.account_id
    reservation.cancellation_reason = reason

    if opening:
        if opening.starts_at > now and opening.listing_expires_at > now:
            opening.status = "OPEN"
        else:
            opening.status = "EXPIRED"
        opening.version += 1

    db.add(reservation)
    if opening:
        db.add(opening)

    db.commit()
    db.refresh(reservation)
    return reservation


def list_my_reservations(db: Session, account: Account) -> list[Reservation]:
    expire_stale_holds(db)

    return (
        db.query(Reservation)
        .filter(Reservation.client_account_id == account.account_id)
        .order_by(Reservation.created_at.desc())
        .all()
    )


def list_business_reservations(db: Session, account: Account) -> list[Reservation]:
    business = _get_vendor_business(db, account)

    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business account required",
        )

    expire_stale_holds(db)

    return (
        db.query(Reservation)
        .join(Opening, Reservation.opening_id == Opening.opening_id)
        .filter(Opening.business_id == business.business_id)
        .order_by(Reservation.created_at.desc())
        .all()
    )