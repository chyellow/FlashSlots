from sqlalchemy import Column, BigInteger, Float, ForeignKey, DATETIME, String, func
from sqlalchemy.orm import relationship
from services.api.app.db import base

class Review(base):
    __tablename__ = "reviews"

    review_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False)
    business_id = Column(BigInteger, ForeignKey("businesses.business_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(String)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationships
    user = relationship("Account", back_populates="reviews")
    business = relationship("Business", back_populates="reviews")