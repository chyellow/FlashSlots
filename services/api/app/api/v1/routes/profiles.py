from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse

router = APIRouter()

@router.get("/profiles/{username}", response_model=ProfileResponse)
def get_profile(username: str, db: Session = Depends(get_db)):
    profile = (
        db.query(Profile)
        .filter(Profile.username == username.lower())
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(
        profile_id=profile.profile_id,
        display_name=profile.display_name,
        phone=profile.phone,
        city=profile.city,
        state=profile.state_region,
    )