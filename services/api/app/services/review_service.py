from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models import Account, Business, Opening, Profile, Reservation, Review
from app.schemas.reviews import ReviewCreate


def create_review(db: Session, account: Account, payload: ReviewCreate) -> Review:
    if account.role != "CLIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can leave reviews",
        )

    reservation = (
        db.query(Reservation)
        .filter(Reservation.reservation_id == payload.reservation_id)
        .first()
    )

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.client_account_id != account.account_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if reservation.status != "COMPLETED":
        raise HTTPException(
            status_code=409,
            detail="Can only review completed appointments",
        )

    existing = (
        db.query(Review)
        .filter(Review.reservation_id == payload.reservation_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already reviewed")

    opening = db.get(Opening, reservation.opening_id)
    if not opening:
        raise HTTPException(status_code=404, detail="Opening not found")

    review = Review(
        reservation_id=reservation.reservation_id,
        reviewer_account_id=account.account_id,
        business_id=opening.business_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "review_id": review.review_id,
        "reservation_id": review.reservation_id,
        "reviewer_account_id": review.reviewer_account_id,
        "business_id": review.business_id,
        "rating": review.rating,
        "comment": review.comment,
        "reviewer_name": None,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }


def get_my_reviews(db: Session, account: Account) -> list[dict]:
    reviews = (
        db.query(Review)
        .filter(Review.reviewer_account_id == account.account_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return [
        {
            "review_id": r.review_id,
            "reservation_id": r.reservation_id,
            "reviewer_account_id": r.reviewer_account_id,
            "business_id": r.business_id,
            "rating": r.rating,
            "comment": r.comment,
            "reviewer_name": None,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }
        for r in reviews
    ]


def get_reviews_for_business(db: Session, business_id: int) -> list[dict]:
    business = db.query(Business).filter(Business.business_id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    reviews = (
        db.query(Review)
        .options(joinedload(Review.reviewer).joinedload(Account.profile))
        .filter(Review.business_id == business_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    result = []
    for r in reviews:
        profile = r.reviewer.profile if r.reviewer else None
        result.append({
            "review_id": r.review_id,
            "reservation_id": r.reservation_id,
            "reviewer_account_id": r.reviewer_account_id,
            "business_id": r.business_id,
            "rating": r.rating,
            "comment": r.comment,
            "reviewer_name": profile.display_name if profile else None,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        })

    return result


def get_business_rating(db: Session, business_id: int) -> dict:
    business = db.query(Business).filter(Business.business_id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    row = (
        db.query(
            func.avg(Review.rating).label("avg"),
            func.count(Review.review_id).label("cnt"),
        )
        .filter(Review.business_id == business_id)
        .one()
    )

    return {
        "business_id": business_id,
        "average_rating": round(float(row.avg), 2) if row.avg else None,
        "total_reviews": row.cnt,
    }


def get_client_cancellation_count(db: Session, account_id: int) -> dict:
    count = (
        db.query(func.count(Reservation.reservation_id))
        .filter(
            Reservation.client_account_id == account_id,
            Reservation.status == "CANCELLED_BY_CLIENT",
        )
        .scalar()
    )

    return {
        "account_id": account_id,
        "cancellation_count": count,
    }
