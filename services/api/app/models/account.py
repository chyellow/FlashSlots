from sqlalchemy import Column, BigInteger, String, Enum, DATETIME, func
from sqlalchemy.orm import relationship
from services.api.app.db import base
from services.api.app.models.enums import AccountType, AccountStatus

class Account(base):
    __tablename__ = "accounts"

    account_id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    status = Column(Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE)
    role = Column(Enum(AccountType), nullable=False)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationships
    profile = relationship("Profile", back_populates="account", uselist=False)
    business = relationship("Business", back_populates="owner_account", uselist=False)
    openings_listed = relationship("Opening", back_populates="posted_by_account")
    reservations = relationship("Reservation", back_populates="client_account")
    cancelled_reservations = relationship("Reservation", back_populates="cancelled_by_account", foreign_keys="Reservation.cancelled_by_account_id")
    notifications = relationship("Notification", back_populates="recipient")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan", )