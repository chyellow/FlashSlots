from sqlalchemy import Column, BigInteger, DATETIME, ForeignKey, Enum, String, func
from sqlalchemy.orm import relationship
from services.api.app.db import base
from services.api.app.models.enums import NotificationType

class Notification(base):
    __tablename__ = "notifications"

    notification_id = Column(BigInteger, primary_key=True, autoincrement=True)
    recipient_id = Column(BigInteger, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DATETIME, server_default=func.now())
    updated_at = Column(DATETIME, server_default=func.now(), onupdate=func.now())

    #Relationships
    recipient = relationship("Account", back_populates="notifications")