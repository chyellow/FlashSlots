# services/api/app/api/v1/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.account import Account
from app.models.profile import Profile
from app.models.enums import AccountType, AccountStatus
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):

    # 1. Check if email is already taken
    existing = db.query(Account).filter(Account.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists"
        )

    # 2. Check if username is already taken
    existing_username = db.query(Profile).filter(
        Profile.username == body.username.lower()
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That username is already taken"
        )

    # 3. Validate password length
    if len(body.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be 72 characters or fewer"
        )
    if len(body.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters"
        )

    # 4. Create the account
    account = Account(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=AccountType[body.role.value],
        status=AccountStatus.ACTIVE,
    )
    db.add(account)
    db.flush()

    # 5. Create the profile with username and phone
    profile = Profile(
        account_id=account.account_id,
        display_name=body.display_name,
        username=body.username.lower(),
        phone=body.phone,
    )
    db.add(profile)
    db.commit()
    db.refresh(account)

    token = create_access_token({
        "sub": str(account.account_id),
        "role": account.role.value,
    })

    return TokenResponse(
        access_token=token,
        role=account.role.value,
        account_id=account.account_id,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):

    # 1. Look up the account by email
    account = db.query(Account).filter(Account.email == body.email.lower()).first()

    # 2. Verify password — same error whether email or password is wrong
    #    (don't tell attackers which one failed)
    if not account or not verify_password(body.password, account.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Block suspended or deactivated accounts
    if account.status != AccountStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active"
        )

    # 4. Issue the token
    token = create_access_token({
        "sub": str(account.account_id),
        "role": account.role.value,
    })

    return TokenResponse(
        access_token=token,
        role=account.role.value,
        account_id=account.account_id,
    )

@router.get("/me")
def me(current_user: Account = Depends(get_current_user)):
        return {
            "account_id": current_user.account_id,
            "email": current_user.email,
            "role": current_user.role.value,
            "status": current_user.status.value,
        }

@router.get("/me/profile")
def get_my_profile(
    current_user: Account = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.account_id == current_user.account_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "account_id": current_user.account_id,
        "display_name": profile.display_name,
        "email": current_user.email,
        "username": profile.username,
        "phone": profile.phone,
        "city": profile.city,
        "state": profile.state_region,
    }


@router.patch("/me/profile")
def update_my_profile(
    body: dict,
    current_user: Account = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.account_id == current_user.account_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    allowed = {"phone", "city", "state_region", "display_name"}
    for key, value in body.items():
        if key in allowed:
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {
        "account_id": current_user.account_id,
        "display_name": profile.display_name,
        "email": current_user.email,
        "username": profile.username,
        "phone": profile.phone,
        "city": profile.city,
        "state": profile.state_region,
    }