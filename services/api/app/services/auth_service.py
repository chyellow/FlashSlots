from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models import Account, Profile, Business
from app.schemas.auth import RegisterRequest, LoginRequest, AuthTokenResponse, CurrentAccountRead


def _build_auth_response(account: Account) -> AuthTokenResponse:
    token = create_access_token(subject=str(account.account_id), role=account.role)
    return AuthTokenResponse(
        access_token=token,
        account_id=account.account_id,
        email=account.email,
        role=account.role,
    )


def register_account(db: Session, payload: RegisterRequest) -> AuthTokenResponse:
    existing_email = db.query(Account).filter(Account.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already in use",
        )

    if payload.username:
        existing_username = db.query(Profile).filter(Profile.username == payload.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already in use",
            )

    account = Account(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        status="ACTIVE",
    )
    db.add(account)
    db.flush()

    profile = Profile(
        account_id=account.account_id,
        display_name=payload.display_name,
        username=payload.username,
        phone=payload.phone,
        city=payload.city,
        state_region=payload.state_region,
    )
    db.add(profile)

    if payload.role == "BUSINESS":
        business = Business(
            owner_account_id=account.account_id,
            display_name=payload.business_display_name or payload.display_name,
            description=payload.business_description,
            address_line1=payload.address_line1 or "TBD",
            city=payload.business_city or payload.city or "TBD",
            state_region=payload.business_state_region or payload.state_region or "TBD",
            postal_code=payload.postal_code or "00000",
            timezone=payload.timezone or "America/New_York",
            verification_status="PENDING",
            default_payment_option=payload.default_payment_option or "BOTH",
            is_active=True,
        )
        db.add(business)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account creation failed due to a conflicting value",
        )

    db.refresh(account)
    return _build_auth_response(account)


def login_account(db: Session, payload: LoginRequest) -> AuthTokenResponse:
    account = db.query(Account).filter(Account.email == payload.email).first()

    if not account or not verify_password(payload.password, account.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if account.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active",
        )

    return _build_auth_response(account)


def get_current_account_payload(account: Account) -> CurrentAccountRead:
    return CurrentAccountRead(
        account_id=account.account_id,
        email=account.email,
        role=account.role,
        status=account.status,
    )