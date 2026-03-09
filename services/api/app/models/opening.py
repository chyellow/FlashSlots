from sqlalchemy import Column, BigInteger, String, DATETIME, INTEGER, Numeric, ForeignKey, Enum, func, text
from sqlalchemy.orm import relationship
from services.api.app.db import base
from services.api.app.models.enums import SlotStatus, PaymentOptions

class Opening(base):
    __tablename__ = "openings"

    opening_id = Column(BigInteger, primary_key=True, autoincrement=True)
    business_id = Column(BigInteger, ForeignKey("businesses.business_id", ondelete="CASCADE"), nullable=False)
    posted_by_account_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="RESTRICT"), nullable=False)
    staff_name = Column(String)
    title = Column(String)
    description = Column(String)
    starts_at = Column(DATETIME, nullable=False)
    ends_at = Column(DATETIME, nullable=False)
    listed_price = Column(Numeric(10,2), nullable=False)
    payment_option = Column(Enum(PaymentOptions), nullable=False, default=PaymentOptions.BOTH)
    status = Column(Enum(SlotStatus), nullable=False, default=SlotStatus.OPEN)
    listing_expires_at = Column(DATETIME, server_default=text("NOW() + INTERVAL '15 minutes'"))
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())
    version = Column(INTEGER, nullable= False, default=1)

    #relationships
    business = relationship("Business", back_populates="openings")
    posted_by_account = relationship("Account", back_populates="openings_listed")
    reservations = relationship("Reservation", back_populates="opening", uselist=False)
