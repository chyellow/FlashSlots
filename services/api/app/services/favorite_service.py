from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Account, Business, Favorite

def add_favorite(db: Session, account: Account, business_id: int):
    if account.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only clients can add favorites")

    business = db.query(Business).filter(Business.business_id == business_id).first()

    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    existing = db.query(Favorite).filter(
        Favorite.client_account_id == account.account_id,
                 Favorite.business_id == business_id
    ).first()

    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already favorited")

    fav = Favorite(client_account_id = account.account_id, business_id = business_id)

    db.add(fav)
    db.commit()
    db.refresh(fav)

    return {
        "favorite_id": fav.favorite_id,
        "client_account_id": fav.client_account_id,
        "business_id": fav.business_id,
        "created_at": fav.created_at,
            }

def remove_favorite(db: Session, account: Account, business_id: int):
    fav = db.query(Favorite).filter(
    Favorite.client_account_id == account.account_id,
            Favorite.business_id == business_id
    ).first()

    if not fav:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )

    db.delete(fav)
    db.commit()

    return {"message": "Unfavorited"}

def get_my_favorites(db: Session, account: Account) -> list[dict]:
    favorites = (
        db.query(Favorite)
        .filter(Favorite.client_account_id == account.account_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )

    return [
        {
            "favorite_id": f.favorite_id,
            "business_id": f.business_id,
            "created_at": f.created_at,
        }
        for f in favorites
    ]
