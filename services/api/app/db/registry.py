# services/api/app/db/registry.py
# Import all models here so SQLAlchemy can resolve relationships.
# This file should only be imported once, in main.py.

from app.models.account import Account
from app.models.profile import Profile
from app.models.business import Business
from app.models.opening import Opening
from app.models.reservation import Reservation
from app.models.notification import Notification
from app.models.review import Review