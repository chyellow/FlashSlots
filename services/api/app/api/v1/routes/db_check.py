from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter()


@router.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    now = db.execute(text("SELECT NOW()")).scalar_one()
    openings_open = db.execute(
        text("SELECT COUNT(*) FROM openings WHERE status = 'OPEN'")
    ).scalar_one()

    return {
        "db_time": str(now),
        "openings_open": int(openings_open),
    }