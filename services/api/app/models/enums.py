import enum

#Account roles
class AccountType(enum.Enum):
    CLIENT = "CLIENT"
    BUSINESS = "BUSINESS"
    ADMIN = "ADMIN"

#Accunt Status
class AccountStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DEACTIVATED = "DEACTIVATED"

#Reservation Status
class ReservationStatus(enum.Enum):
    HOLD = "HOLD"
    HOLD_EXPIRED = "HOLD_EXPIRED"
    CANCELLED_BY_CLIENT = "CANCELLED_BY_CLIENT"
    CANCELLED_BY_BUSINESS = "CANCELLED_BY_BUSINESS"
    COMPLETED = "COMPLETED"
    CONFIRMED = "CONFIRMED"

#Slot Status
class SlotStatus(enum.Enum):
    OPEN = "OPEN"
    ON_HOLD = "ON_HOLD"
    BOOKED = "BOOKED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    HELD = "HELD"

#Payment Options
class PaymentOptions(enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    BOTH = "BOTH"

#Notification Type
class NotificationType(enum.Enum):
    REMINDER = "REMINDER"
    INFO = "INFO"
    ALERT = "ALERT"

#Verification Status
class VerificationStatus(enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
