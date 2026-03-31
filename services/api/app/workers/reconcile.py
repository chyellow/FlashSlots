from app.db.session import SessionLocal
from app.services.booking_service import expire_stale_holds
from app.services.opening_service import expire_stale_openings


def run_reconcile() -> None:
    db = SessionLocal()
    try:
        expire_stale_holds(db)
        expire_stale_openings(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_reconcile()