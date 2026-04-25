from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from app.models.base import Base


class Review(Base):
    __tablename__ = "reviews"

    review_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    reservation_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("reservations.reservation_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    reviewer_account_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("accounts.account_id", ondelete="CASCADE"),
        nullable=False,
    )
    business_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("businesses.business_id", ondelete="CASCADE"),
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
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

    reviewer = relationship("Account", back_populates="reviews")
    business = relationship("Business", back_populates="reviews")
    reservation = relationship("Reservation", back_populates="review")
