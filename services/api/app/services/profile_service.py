from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models import Profile, Account
from app.schemas.profiles import ProfileUpdate


def get_my_profile(db: Session, account: Account) -> Profile:
    profile = (
        db.query(Profile)
        .options(joinedload(Profile.account))
        .filter(Profile.account_id == account.account_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


def update_my_profile(db: Session, account: Account, payload: ProfileUpdate) -> Profile:
    profile = get_my_profile(db, account)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)

    db.add(profile)
    db.commit()
    return get_my_profile(db, account)
