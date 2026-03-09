from sqlalchemy import Column, BigInteger, String, Boolean, Enum, ForeignKey, DATETIME, func
from sqlalchemy.orm import relationship
from services.api.app.db import base
from services.api.app.models.enums import PaymentOptions, VerificationStatus

class Business(base):
    __tablename__ = "businesses"

    business_id = Column(BigInteger, primary_key=True, autoincrement=True)
    owner_account_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name = Column(String, nullable=False)
    description = Column(String)
    address_line1 = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state_region = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    timezone = Column(String, nullable=False)
    verification_status = Column(Enum(VerificationStatus), nullable=False, default=VerificationStatus.PENDING)
    default_payment_option = Column(Enum(PaymentOptions), nullable=False, default=PaymentOptions.BOTH)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationships
    owner_account = relationship("Account", back_populates="business", uselist=False)
    openings = relationship("Opening", back_populates="business")
    reviews = relationship("Review", back_populates="reviews", cascade="all, delete-orphan")





