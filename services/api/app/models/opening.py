from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Opening(Base):
    __tablename__ = "openings"

    opening_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    business_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("businesses.business_id", ondelete="CASCADE"),
        nullable=False,
    )
    posted_by_account_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("accounts.account_id", ondelete="RESTRICT"),
        nullable=False,
    )
    staff_name: Mapped[str | None] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    listed_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_option: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="OPEN")
    listing_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

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

    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    business = relationship("Business", back_populates="openings")
    reservation = relationship("Reservation", back_populates="opening", uselist=False)

    @property
    def client_name(self) -> str | None:
        if self.reservation and self.reservation.client and self.reservation.client.profile:
            return self.reservation.client.profile.display_name
        return None