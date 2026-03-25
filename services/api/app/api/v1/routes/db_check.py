from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.system_service import run_db_check

router = APIRouter()

@router.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    return run_db_check(db)
