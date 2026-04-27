from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Favorite(Base):
    __tablename__ = 'favorites'

    favorite_id = Mapped[int] = mapped_column(BigInteger, primary_key=True)

    client_account_id = Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False,)

    business_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("businesses.business_id", ondelete="CASCADE"), nullable=False,)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(), nullable=False,)

    __table_args__ = (UniqueConstraint('client_account_id', 'business_id'),)

    client = relationship(
        "Account",
        foreign_keys=[client_account_id],
        back_populates="favorites",
    )

    business = relationship(
    "Business",
    foreign_keys=[business_id],
    back_populates="favorited_by",
)