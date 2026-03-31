from typing import Annotated
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Account


def get_current_account(
        db: Session = Depends(get_db),
        x_account_id: Annotated[int | None, Header(alias="X-Account-Id")] = None,
) -> Account:
    if x_account_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Account-Id header",
        )

    account = db.get(Account, x_account_id)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid account",
        )

    return account