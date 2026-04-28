from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from app.models.base import Base


class Account(Base):
    __tablename__ = "accounts"

    account_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    profile = relationship("Profile", back_populates="account", uselist=False)
    business = relationship("Business", back_populates="owner", uselist=False)

    # reservations where this account is the client
    reservations = relationship(
        "Reservation",
        back_populates="client",
        foreign_keys="Reservation.client_account_id",
    )

    # reservations this account cancelled
    cancelled_reservations = relationship(
        "Reservation",
        back_populates="cancelled_by",
        foreign_keys="Reservation.cancelled_by_account_id",
    )

    reviews = relationship("Review", back_populates="reviewer")

    favorites = relationship("Favorite", foreign_keys="Favorite.client_account_id", back_populates = "client", cascade="all, delete-orphan")