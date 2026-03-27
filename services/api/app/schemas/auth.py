# services/api/app/schemas/auth.py

from pydantic import BaseModel, EmailStr
from enum import Enum

class RoleChoice(str, Enum):
    CLIENT = "CLIENT"
    BUSINESS = "BUSINESS"

# --- Incoming requests ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: RoleChoice
    display_name: str  # used to create their profile record

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Outgoing responses ---

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    account_id: int

