from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Business, Account
from app.schemas.businesses import BusinessUpdate


def get_my_business(db: Session, account: Account) -> Business:
    if account.role != "BUSINESS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business account required",
        )

    business = db.query(Business).filter(
        Business.owner_account_id == account.account_id
    ).first()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return business


def update_my_business(db: Session, account: Account, payload: BusinessUpdate) -> Business:
    business = get_my_business(db, account)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(business, key, value)

    db.add(business)
    db.commit()
    db.refresh(business)
    return business