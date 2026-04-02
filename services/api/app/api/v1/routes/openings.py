from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_account
from app.db.session import get_db
from app.models import Account
from app.schemas.openings import OpeningCreate, OpeningUpdate, OpeningRead
from app.services.opening_service import (
    create_opening,
    update_opening,
    cancel_opening,
    list_live_openings,
    list_my_openings,
    get_opening,
)

router = APIRouter(prefix="/openings", tags=["openings"])


@router.get("", response_model=list[OpeningRead])
def list_openings(
        mine: bool = Query(default=False),
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    if mine:
        return list_my_openings(db, account)
    return list_live_openings(db)


@router.get("/{opening_id}", response_model=OpeningRead)
def read_opening(
        opening_id: int,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return get_opening(db, opening_id)


@router.post("", response_model=OpeningRead)
def post_opening(
        payload: OpeningCreate,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return create_opening(db, account, payload)


@router.patch("/{opening_id}", response_model=OpeningRead)
def patch_opening(
        opening_id: int,
        payload: OpeningUpdate,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return update_opening(db, account, opening_id, payload)


@router.delete("/{opening_id}", response_model=OpeningRead)
def delete_opening(
        opening_id: int,
        db: Session = Depends(get_db),
        account: Account = Depends(get_current_account),
):
    return cancel_opening(db, account, opening_id)