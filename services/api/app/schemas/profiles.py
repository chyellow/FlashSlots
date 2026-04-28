from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    profile_id: int
    account_id: int
    email: EmailStr
    display_name: str
    phone: str | None = None
    city: str | None = None
    state_region: str | None = None
    username: str | None = None
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    phone: str | None = None
    city: str | None = None
    state_region: str | None = None
    username: str | None = None 
