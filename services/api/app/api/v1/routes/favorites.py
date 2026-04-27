from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_account
from app.models.account import Account

from app.services.favorite_service import (add_favorite, remove_favorite, get_my_favorites)

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("/me")
def my_favorites(db: Session = Depends(get_db),
                 account: Account = Depends(get_current_account)):
    return get_my_favorites(db, account)

@router.post("/{business_id}")
def favorite_business(business_id: int, db : Session = Depends(get_db),
                      account: Account = Depends(get_current_account)):
    return add_favorite(db, business_id, account)

@router.delete("/{business_id}")
def unfavorite_buisness(business_id: int, db : Session = Depends(get_db),
                        account: Account = Depends(get_current_account)):
    return remove_favorite(db, account, business_id)