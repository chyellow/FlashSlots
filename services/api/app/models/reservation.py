from sqlalchemy import Column, BigInteger, DATETIME, ForeignKey, Enum, String, func
from sqlalchemy.orm import relationship
from services.api.app.db import base
from services.api.app.models.enums import ReservationStatus

class Reservation(base):
    __tablename__ = "reservations"

    reservation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    opening_id = Column(BigInteger, ForeignKey("openings.opening_id", ondelete="CASCADE"), nullable=False, unique=True)
    client_account_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(ReservationStatus), nullable=False, default=ReservationStatus.HOLD)
    hold_expires_at = Column(DATETIME)
    confirmed_at = Column(DATETIME)
    cancelled_at = Column(DATETIME)
    cancelled_by_account_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="SET NULL"))
    cancellation_reason = Column(String)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationships
    opening = relationship("Opening", back_populates="reservations", uselist=False)
    client_account = relationship("Account", back_populates="reservations")
    cancelled_by_account = relationship("Account", foreign_keys=[cancelled_by_account_id])