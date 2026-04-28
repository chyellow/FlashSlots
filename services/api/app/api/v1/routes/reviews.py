from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.reviews import (
    ReviewCreate,
    ReviewRead,
    BusinessRatingRead,
    ClientStatsRead,
)
from app.services.review_service import (
    create_review,
    get_my_reviews,
    get_reviews_for_business,
    get_business_rating,
    get_client_cancellation_count,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/me", response_model=list[ReviewRead])
def my_reviews(
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
):
    return get_my_reviews(db, account)


@router.post("", response_model=ReviewRead)
def post_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
):
    return create_review(db, account, payload)


@router.get("/business/{business_id}", response_model=list[ReviewRead])
def list_business_reviews(
    business_id: int,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
):
    return get_reviews_for_business(db, business_id)


@router.get("/business/{business_id}/rating", response_model=BusinessRatingRead)
def read_business_rating(
    business_id: int,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
):
    return get_business_rating(db, business_id)


@router.get("/client/{account_id}/stats", response_model=ClientStatsRead)
def read_client_stats(
    account_id: int,
    db: Session = Depends(get_db),
    account: Account = Depends(get_current_account),
):
    return get_client_cancellation_count(db, account_id)
