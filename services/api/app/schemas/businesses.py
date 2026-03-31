from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BusinessRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    business_id: int
    owner_account_id: int
    display_name: str
    description: str | None = None
    address_line1: str
    city: str
    state_region: str
    postal_code: str
    latitude: float | None = None
    longitude: float | None = None
    timezone: str
    verification_status: str
    default_payment_option: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class BusinessUpdate(BaseModel):
    display_name: str | None = None
    description: str | None = None
    address_line1: str | None = None
    city: str | None = None
    state_region: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    default_payment_option: str | None = None