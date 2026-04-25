from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from app.models.base import Base


class Business(Base):
    __tablename__ = "businesses"

    business_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    owner_account_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("accounts.account_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    address_line1: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(Text, nullable=False)
    state_region: Mapped[str] = mapped_column(Text, nullable=False)
    postal_code: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    timezone: Mapped[str] = mapped_column(Text, nullable=False)
    verification_status: Mapped[str] = mapped_column(Text, nullable=False)
    default_payment_option: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
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

    owner = relationship("Account", back_populates="business")
    openings = relationship("Opening", back_populates="business")
    reviews = relationship("Review", back_populates="business")