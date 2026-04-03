from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class OpeningCreate(BaseModel):
    staff_name: str | None = None
    title: str | None = None
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    listed_price: Decimal
    payment_option: str
    listing_expires_at: datetime


class OpeningUpdate(BaseModel):
    staff_name: str | None = None
    title: str | None = None
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    listed_price: Decimal | None = None
    payment_option: str | None = None
    listing_expires_at: datetime | None = None
    status: str | None = None


class OpeningRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opening_id: int
    business_id: int
    posted_by_account_id: int
    staff_name: str | None = None
    client_name: str | None = None
    title: str | None = None
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    listed_price: Decimal
    payment_option: str
    status: str
    listing_expires_at: datetime
    created_at: datetime
    updated_at: datetime
    version: int

