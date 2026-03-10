from pydantic import BaseModel

class ProfileResponse(BaseModel):
    profile_id: int
    display_name: str
    phone: str | None = None
    city: str | None = None
    state: str | None = None

    model_config = {"from_attributes": True}