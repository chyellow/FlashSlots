from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HoldRequest(BaseModel):
    """opening_id must be a positive bigint (matches DB / API expectations)."""

    opening_id: int = Field(ge=1)


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reservation_id: int
    opening_id: int
    client_account_id: int
    status: str
    hold_expires_at: datetime | None = None
    confirmed_at: datetime | None = None
    cancelled_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_by_account_id: int | None = None
    cancellation_reason: str | None = None
    created_at: datetime
    updated_at: datetime