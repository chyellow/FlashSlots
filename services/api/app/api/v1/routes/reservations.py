from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.api.app.db.session import get_db
from services.api.app.services.booking_service import (hold_reservation, confirm_reservation, expire_holds)

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("/hold")
def hold(opening_id: int, client_id: int, db:Session = Depends(get_db)):
    expire_holds(db)
    res = hold_reservation(db, opening_id, client_id)
    if not res:
        raise HTTPException(status_code=400, detail="Unable to place hold")
    return res

@router.post("/{reservation_id}/confirm")
def confirm(reservation_id:int, db : Session = Depends(get_db)):
    res = confirm_reservation(db, reservation_id)
    if not res:
        raise HTTPException(status_code=409, detail="Invalid or expired reservation")
    return res