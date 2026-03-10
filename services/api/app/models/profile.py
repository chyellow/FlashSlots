from sqlalchemy import BigInteger, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Profile(Base):
    __tablename__ = "profiles"

    profile_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    account_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.account_id"), unique=True)
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(Text)
    state_region: Mapped[str | None] = mapped_column(Text)
    username: Mapped[str | None] = mapped_column(Text, unique=True)