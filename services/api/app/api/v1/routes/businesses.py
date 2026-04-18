from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.businesses import BusinessRead, BusinessUpdate
from app.services.business_service import get_my_business, get_business_by_id, update_my_business

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("/me", response_model=BusinessRead)
def read_my_business(
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return get_my_business(db, account)


@router.patch("/me", response_model=BusinessRead)
def patch_my_business(
        payload: BusinessUpdate,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return update_my_business(db, account, payload)


@router.get("/{business_id}", response_model=BusinessRead)
def read_business(
        business_id: int,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return get_business_by_id(db, business_id)