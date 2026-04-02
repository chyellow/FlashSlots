from datetime import datetime
from enum import UNIQUE

from sqlalchemy import BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from app.models.base import Base


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    opening_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("openings.opening_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    client_account_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("accounts.account_id", ondelete="RESTRICT"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(Text, nullable=False)
    hold_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_by_account_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("accounts.account_id", ondelete="SET NULL"),
    )
    cancellation_reason: Mapped[str | None] = mapped_column(Text)
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

    opening = relationship("Opening", back_populates="reservation")

    client = relationship(
        "Account",
        back_populates="reservations",
        foreign_keys=[client_account_id],
    )

    cancelled_by = relationship(
        "Account",
        back_populates="cancelled_reservations",
        foreign_keys=[cancelled_by_account_id],
    )