from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.auth import RegisterRequest, LoginRequest, AuthTokenResponse, CurrentAccountRead
from app.services.auth_service import (
    register_account,
    login_account,
    get_current_account_payload,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthTokenResponse)
def register(
        payload: RegisterRequest,
        db: Session = Depends(get_db),
):
    return register_account(db, payload)


@router.post("/login", response_model=AuthTokenResponse)
def login(
        payload: LoginRequest,
        db: Session = Depends(get_db),
):
    return login_account(db, payload)


@router.get("/me", response_model=CurrentAccountRead)
def me(
        account: Account = Depends(get_current_account),
):
    return get_current_account_payload(account)