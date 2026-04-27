import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from zoneinfo import ZoneInfo

from app.core.config import settings

logger = logging.getLogger(__name__)

EST = ZoneInfo("America/New_York")


def _send(to: str, subject: str, html: str) -> None:
    if not settings.smtp_email or not settings.smtp_app_password:
        logger.warning("SMTP credentials not set — skipping email to %s", to)
        return

    msg = MIMEMultipart("alternative")
    msg["From"] = f"FlashSlots <{settings.smtp_email}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.smtp_email, settings.smtp_app_password)
            server.sendmail(settings.smtp_email, to, msg.as_string())
    except Exception:
        logger.exception("Failed to send email to %s", to)


def _fmt_time(dt: datetime) -> str:
    local = dt.astimezone(EST)
    return local.strftime("%A, %B %-d at %-I:%M %p") + " ET"


def send_booking_confirmed_to_client(
    client_email: str,
    client_name: str,
    business_name: str,
    title: str | None,
    starts_at: datetime,
    ends_at: datetime,
) -> None:
    slot = f"{_fmt_time(starts_at)} – {ends_at.astimezone(EST).strftime('%-I:%M %p')}"
    _send(
        to=client_email,
        subject=f"Booking confirmed with {business_name}",
        html=(
            f"<h2>You're booked!</h2>"
            f"<p>Hi {client_name},</p>"
            f"<p>Your appointment{f' for <strong>{title}</strong>' if title else ''} "
            f"with <strong>{business_name}</strong> is confirmed.</p>"
            f"<p><strong>When:</strong> {slot}</p>"
            f"<p>See you there!</p>"
            f"<p style='color:#888;font-size:12px'>— FlashSlots</p>"
        ),
    )


def send_booking_confirmed_to_vendor(
    vendor_email: str,
    client_name: str,
    business_name: str,
    title: str | None,
    starts_at: datetime,
    ends_at: datetime,
) -> None:
    slot = f"{_fmt_time(starts_at)} – {ends_at.astimezone(EST).strftime('%-I:%M %p')}"
    _send(
        to=vendor_email,
        subject=f"New booking: {client_name}",
        html=(
            f"<h2>New booking!</h2>"
            f"<p>Hi {business_name},</p>"
            f"<p><strong>{client_name}</strong> has booked "
            f"{'<strong>' + title + '</strong>' if title else 'an appointment'} "
            f"with you.</p>"
            f"<p><strong>When:</strong> {slot}</p>"
            f"<p style='color:#888;font-size:12px'>— FlashSlots</p>"
        ),
    )


def send_cancellation_to_client(
    client_email: str,
    client_name: str,
    business_name: str,
    title: str | None,
    starts_at: datetime,
    reason: str | None,
) -> None:
    _send(
        to=client_email,
        subject=f"Appointment cancelled by {business_name}",
        html=(
            f"<h2>Appointment cancelled</h2>"
            f"<p>Hi {client_name},</p>"
            f"<p>Your appointment{f' for <strong>{title}</strong>' if title else ''} "
            f"with <strong>{business_name}</strong> on {_fmt_time(starts_at)} "
            f"has been cancelled by the provider.</p>"
            f"{f'<p><strong>Reason:</strong> {reason}</p>' if reason else ''}"
            f"<p style='color:#888;font-size:12px'>— FlashSlots</p>"
        ),
    )


def send_cancellation_to_vendor(
    vendor_email: str,
    client_name: str,
    business_name: str,
    title: str | None,
    starts_at: datetime,
    reason: str | None,
) -> None:
    _send(
        to=vendor_email,
        subject=f"Booking cancelled by {client_name}",
        html=(
            f"<h2>Booking cancelled</h2>"
            f"<p>Hi {business_name},</p>"
            f"<p><strong>{client_name}</strong> has cancelled their appointment"
            f"{f' for <strong>{title}</strong>' if title else ''} "
            f"on {_fmt_time(starts_at)}.</p>"
            f"{f'<p><strong>Reason:</strong> {reason}</p>' if reason else ''}"
            f"<p style='color:#888;font-size:12px'>— FlashSlots</p>"
        ),
    )
