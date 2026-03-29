# services/api/app/core/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.account import Account
from app.models.enums import AccountStatus, AccountType
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Account:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode and validate the token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # Extract the account ID from the token
    account_id: str = payload.get("sub")
    if account_id is None:
        raise credentials_exception

    # Fetch the account from the database
    account = db.query(Account).filter(
        Account.account_id == int(account_id)
    ).first()

    if account is None:
        raise credentials_exception

    # Block suspended or deactivated accounts
    if account.status != AccountStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active"
        )

    return account


def require_client(account: Account = Depends(get_current_user)) -> Account:
    if account.role != AccountType.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client accounts can perform this action"
        )
    return account


def require_business(account: Account = Depends(get_current_user)) -> Account:
    if account.role != AccountType.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business accounts can perform this action"
        )
    return account