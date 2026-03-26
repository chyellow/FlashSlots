from sqlalchemy import text
from sqlalchemy.orm import Session

def run_db_check(db: Session):
    now = db.execute(text("SELECT NOW()")).scalar_one()
    count = db.execute(
        text("SELECT COUNT(*) FROM openings WHERE status = 'OPEN'")
    ).scalar_one()
    return {
        "db_time": str(now),
        "openings_open": int(count),
    }
