from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models import Opening, Business, Account, Reservation
from app.schemas.openings import OpeningCreate, OpeningUpdate


ACTIVE_OPENING_STATUSES = ("OPEN", "ON_HOLD", "BOOKED")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def expire_stale_openings(db: Session) -> None:
    now = _now()

    stale_openings = (
        db.query(Opening)
        .filter(
            Opening.status.in_(("OPEN", "ON_HOLD")),
            ((Opening.listing_expires_at <= now) | (Opening.starts_at <= now)),
        )
        .all()
    )

    for opening in stale_openings:
        opening.status = "EXPIRED"
        opening.version += 1

    if stale_openings:
        db.commit()


def _get_business_for_owner(db: Session, account: Account) -> Business:
    business = db.query(Business).filter(
        Business.owner_account_id == account.account_id
    ).first()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return business


def _validate_opening_payload(
        starts_at: datetime,
        ends_at: datetime,
        listing_expires_at: datetime,
) -> None:
    if ends_at <= starts_at:
        raise HTTPException(status_code=400, detail="ends_at must be after starts_at")

    if listing_expires_at > starts_at:
        raise HTTPException(
            status_code=400,
            detail="listing_expires_at must be before or equal to starts_at",
        )

    if starts_at <= _now():
        raise HTTPException(status_code=400, detail="starts_at must be in the future")


def _check_overlap(
        db: Session,
        business_id: int,
        staff_name: str | None,
        starts_at: datetime,
        ends_at: datetime,
        exclude_opening_id: int | None = None,
) -> None:
    query = db.query(Opening).filter(
        Opening.business_id == business_id,
        Opening.status.in_(ACTIVE_OPENING_STATUSES),
        Opening.starts_at < ends_at,
        Opening.ends_at > starts_at,
        )

    if staff_name:
        query = query.filter(Opening.staff_name == staff_name)

    if exclude_opening_id is not None:
        query = query.filter(Opening.opening_id != exclude_opening_id)

    existing = query.first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Opening overlaps an existing active opening",
        )


def list_live_openings(db: Session) -> list[Opening]:
    expire_stale_openings(db)
    now = _now()

    return (
        db.query(Opening)
        .filter(
            Opening.status == "OPEN",
            Opening.listing_expires_at > now,
            Opening.starts_at > now,
            )
        .order_by(Opening.starts_at.asc())
        .all()
    )


def list_my_openings(db: Session, account: Account) -> list[Opening]:
    business = _get_business_for_owner(db, account)
    expire_stale_openings(db)

    return (
        db.query(Opening)
        .options(
            joinedload(Opening.reservation)
            .joinedload(Reservation.client)
            .joinedload(Account.profile)
        )
        .filter(Opening.business_id == business.business_id)
        .order_by(Opening.starts_at.desc())
        .all()
    )


def get_opening(db: Session, opening_id: int) -> Opening:
    expire_stale_openings(db)
    opening = db.get(Opening, opening_id)

    if not opening:
        raise HTTPException(status_code=404, detail="Opening not found")

    return opening


def create_opening(db: Session, account: Account, payload: OpeningCreate) -> Opening:
    if account.role != "BUSINESS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business account required",
        )

    business = _get_business_for_owner(db, account)

    _validate_opening_payload(
        payload.starts_at,
        payload.ends_at,
        payload.listing_expires_at,
    )

    _check_overlap(
        db,
        business.business_id,
        payload.staff_name,
        payload.starts_at,
        payload.ends_at,
    )

    opening = Opening(
        business_id=business.business_id,
        posted_by_account_id=account.account_id,
        staff_name=payload.staff_name,
        title=payload.title,
        description=payload.description,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        listed_price=payload.listed_price,
        payment_option=payload.payment_option,
        status="OPEN",
        listing_expires_at=payload.listing_expires_at,
    )

    db.add(opening)
    db.commit()
    db.refresh(opening)
    return opening


def update_opening(
        db: Session,
        account: Account,
        opening_id: int,
        payload: OpeningUpdate,
) -> Opening:
    if account.role != "BUSINESS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business account required",
        )

    business = _get_business_for_owner(db, account)
    opening = db.get(Opening, opening_id)

    if not opening or opening.business_id != business.business_id:
        raise HTTPException(status_code=404, detail="Opening not found")

    if opening.status in ("CANCELLED", "EXPIRED"):
        raise HTTPException(status_code=409, detail="Cannot edit this opening")

    data = payload.model_dump(exclude_unset=True)

    starts_at = data.get("starts_at", opening.starts_at)
    ends_at = data.get("ends_at", opening.ends_at)
    listing_expires_at = data.get("listing_expires_at", opening.listing_expires_at)
    staff_name = data.get("staff_name", opening.staff_name)

    _validate_opening_payload(starts_at, ends_at, listing_expires_at)
    _check_overlap(
        db,
        business.business_id,
        staff_name,
        starts_at,
        ends_at,
        exclude_opening_id=opening_id,
    )

    for key, value in data.items():
        setattr(opening, key, value)

    opening.version += 1

    db.add(opening)
    db.commit()
    db.refresh(opening)
    return opening


def cancel_opening(db: Session, account: Account, opening_id: int) -> Opening:
    if account.role != "BUSINESS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business account required",
        )

    business = _get_business_for_owner(db, account)
    opening = db.get(Opening, opening_id)

    if not opening or opening.business_id != business.business_id:
        raise HTTPException(status_code=404, detail="Opening not found")

    if opening.status == "BOOKED":
        raise HTTPException(
            status_code=409,
            detail="Booked opening must be cancelled through reservation flow",
        )

    opening.status = "CANCELLED"
    opening.version += 1

    db.add(opening)
    db.commit()
    db.refresh(opening)
    return opening
