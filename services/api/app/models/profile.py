from sqlalchemy import BigInteger, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from services.api.app.db.base import Base
from services.api.app.models.account import Account

class Profile(Base):
    __tablename__ = "profiles"

    profile_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    account_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.account_id"), unique=True)
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(Text)
    state_region: Mapped[str | None] = mapped_column(Text)
    username: Mapped[str | None] = mapped_column(Text, unique=True)
    account: Mapped["Account"] = relationship("Account", back_populates="profile")  # add this