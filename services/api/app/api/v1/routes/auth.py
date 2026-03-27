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

    # 2. Validate password length (bcrypt limit is 72 bytes)
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
    
    # 2. Create the account
    account = Account(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=AccountType[body.role.value],
        status=AccountStatus.ACTIVE,
    )
    db.add(account)
    db.flush()  # gives us account.account_id before committing

    # 3. Create the profile record that goes with it
    profile = Profile(
        account_id=account.account_id,
        display_name=body.display_name,
    )
    db.add(profile)
    db.commit()
    db.refresh(account)

    # 4. Issue a token so they're logged in immediately after registering
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