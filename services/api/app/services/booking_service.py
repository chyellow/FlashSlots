from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from services.api.app.models.reservation import Reservation
from services.api.app.models.opening import Opening
from services.api.app.models.enums import ReservationStatus, SlotStatus

def hold_reservation(session: Session, opening_id: int, client_id: int) -> Reservation | None:
    """place a 5-minute hold for a client. Check if res already exists for opening. If exists and expired, allow hold. If it doesn't exist create new res with hold status, set timer to 5 minutes"""

    now = datetime.now(timezone.utc)

    #Fetch res for opening
    res = session.query(Reservation).filter_by(opening_id=opening_id).first()
    opening = session.get(Opening, opening_id)

    if not opening or opening.status != SlotStatus.OPEN:
        #opening does not exist or not available
        return None

    if res:
        if res.status == ReservationStatus.HOLD and res.hold_expires_at and res.hold_expires_at < now:
            #prev hold expired, allow new hold
            res.client_account_id = client_id
            res.hold_expires_at = now + timedelta(minutes=5)
            opening.status = SlotStatus.ON_HOLD
            session.commit()
            return res
        else:
            #if slot is held or confirmed
            return None
    else:
        #creating new res
        new_res = Reservation(opening_id=opening_id, client_account_id=client_id, status=ReservationStatus.HOLD, hold_expires_at = now + timedelta(minutes=5))
        opening.status = SlotStatus.ON_HOLD
        session.add(new_res)
        session.commit()
        return new_res

def confirm_reservation(session: Session, reservation_id: int) -> Reservation | None:
    #confirm prev held res. Check if res exists and is still on HOLD, update status to confirmed. set confirmed_at timestamp, clear hold_expires_at
    now = datetime.now(timezone.utc)
    res = session.get(Reservation, reservation_id)
    if not res or res.status != ReservationStatus.HOLD:
        return None

    if res.hold_expires_at and res.hold_expires_at < now:
        return None

    res.status = ReservationStatus.CONFIRMED
    res.confirmed_at = now
    res.hold_expires_at = None

    opening = res.opening
    if opening:
        opening.status = SlotStatus.BOOKED

    session.commit()
    return res


def expire_holds(session: Session):
    #expire all holds that have passed 5 minutes

    now = datetime.now(timezone.utc)

    expired_reservations = session.query(Reservation).filter(Reservation.status == ReservationStatus.HOLD, Reservation.hold_expires_at < now, Reservation.hold_expires_at.isnot(None)).all()

    for res in expired_reservations:
        res.status = ReservationStatus.HOLD_EXPIRED
        res.cancelled_at = now
        res.cancelled_by_account_id = None # system expires

        opening = res.opening
        if opening:
            opening.status = SlotStatus.OPEN

    session.commit()

