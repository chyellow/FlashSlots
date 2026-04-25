from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    reservation_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    review_id: int
    reservation_id: int
    reviewer_account_id: int
    business_id: int
    rating: int
    comment: str | None = None
    reviewer_name: str | None = None
    created_at: datetime
    updated_at: datetime


class BusinessRatingRead(BaseModel):
    business_id: int
    average_rating: float | None = None
    total_reviews: int


class ClientStatsRead(BaseModel):
    account_id: int
    cancellation_count: int
