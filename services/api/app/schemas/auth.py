from pydantic import BaseModel, EmailStr
from enum import Enum

class RoleChoice(str, Enum):
    CLIENT = "CLIENT"
    BUSINESS = "BUSINESS"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: RoleChoice
    display_name: str
    username: str
    phone: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    account_id: int