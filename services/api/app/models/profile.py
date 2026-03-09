from sqlalchemy import Column, BigInteger, String, ForeignKey, DATETIME, func
from sqlalchemy.orm import relationship
from services.api.app.db import base

class Profile(base):
    __tablename__ = "profiles"

    profile_id = Column(BigInteger, primary_key=True, autoincrement=True)
    account_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name = Column(String, nullable=False)
    phone = Column(String)
    city = Column(String)
    state_region = Column(String)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationship
    account = relationship("Account", back_populates="profile", uselist=False)