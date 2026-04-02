from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    role: Literal["CLIENT", "BUSINESS"]

    # profile fields
    display_name: str = Field(min_length=1)
    username: str | None = None
    phone: str | None = None
    city: str | None = None
    state_region: str | None = None

    # optional business fields
    business_display_name: str | None = None
    business_description: str | None = None
    address_line1: str | None = None
    business_city: str | None = None
    business_state_region: str | None = None
    postal_code: str | None = None
    timezone: str | None = None
    default_payment_option: Literal["CARD", "CASH", "BOTH"] | None = "BOTH"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    account_id: int
    email: EmailStr
    role: str


class CurrentAccountRead(BaseModel):
    account_id: int
    email: EmailStr
    role: str
    status: str