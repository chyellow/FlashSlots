from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.profiles import ProfileRead, ProfileUpdate
from app.services.profile_service import get_my_profile, update_my_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileRead)
def read_my_profile(
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return get_my_profile(db, account)


@router.patch("/me", response_model=ProfileRead)
def patch_my_profile(
        payload: ProfileUpdate,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return update_my_profile(db, account, payload)