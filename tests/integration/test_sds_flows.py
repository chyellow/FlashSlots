"""
SDS-aligned system integration tests (HTTP + DB + auth + domain services).

Naming maps to agreed integration test IDs for traceability to SDS / SRS use cases.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

# ---------------------------------------------------------------------------
# Helpers (Arrange / Act / Assert clarity for prod-like readability)
# ---------------------------------------------------------------------------


def _auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def _opening_window(*, start_offset_hours: float = 72.0, duration_hours: float = 1.0) -> tuple[datetime, datetime, datetime]:
    """Valid triple: listing_expires_at <= starts_at < ends_at; all in the future."""
    now = datetime.now(timezone.utc)
    starts_at = now + timedelta(hours=start_offset_hours)
    ends_at = starts_at + timedelta(hours=duration_hours)
    listing_expires_at = starts_at - timedelta(minutes=45)
    return starts_at, ends_at, listing_expires_at


def _opening_json(
    *,
    staff_name: str,
    title: str,
    start_offset_hours: float = 72.0,
    duration_hours: float = 1.0,
) -> dict:
    starts_at, ends_at, listing_expires_at = _opening_window(
        start_offset_hours=start_offset_hours,
        duration_hours=duration_hours,
    )
    return {
        "staff_name": staff_name,
        "title": title,
        "description": "integration",
        "starts_at": starts_at.isoformat(),
        "ends_at": ends_at.isoformat(),
        "listed_price": str(Decimal("40.00")),
        "payment_option": "BOTH",
        "listing_expires_at": listing_expires_at.isoformat(),
    }


def _register_vendor(client, email: str) -> dict:
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Integration1!",
            "role": "BUSINESS",
            "display_name": "Integration Vendor",
            "business_display_name": "Integration Barber Shop",
            "timezone": "America/New_York",
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("access_token")
    assert data.get("role") == "BUSINESS"
    return data


def _register_client(client, email: str, display_name: str = "Integration Client") -> dict:
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Integration1!",
            "role": "CLIENT",
            "display_name": display_name,
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("access_token")
    assert data.get("role") == "CLIENT"
    return data


def _login(client, email: str, password: str) -> dict:
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return resp


# ---------------------------------------------------------------------------
# IT-SDS-UC1-01 — Vendor posts opening; appears on client live feed
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC1_01_vendor_post_opening_visible_on_client_live_feed(
    api_client,
    it_emails,
):
    """
    UC1 main success: vendor publishes a slot; client authenticated feed lists it.
    Cross-module: auth_service + opening_service + reservations join on read paths.
    """
    vendor = _register_vendor(api_client, it_emails["vendor"])
    v_headers = _auth_headers(vendor["access_token"])

    create_resp = api_client.post(
        "/api/v1/openings",
        headers=v_headers,
        json=_opening_json(staff_name="Alex", title="UC1 Flash Slot"),
    )
    assert create_resp.status_code == 200, create_resp.text
    created = create_resp.json()
    opening_id = created["opening_id"]
    assert created["status"] == "OPEN"
    assert Decimal(str(created["listed_price"])) == Decimal("40.00")

    client = _register_client(api_client, it_emails["client_a"])
    c_headers = _auth_headers(client["access_token"])

    feed = api_client.get("/api/v1/openings", headers=c_headers)
    assert feed.status_code == 200, feed.text
    ids = {row["opening_id"] for row in feed.json()}
    assert opening_id in ids, "Live feed must include vendor-posted OPEN slot"


# ---------------------------------------------------------------------------
# IT-SDS-UC2-01 — Client register → login → hold → confirm
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC2_01_client_registers_logs_in_holds_confirms(
    api_client,
    it_emails,
):
    """
    UC2 core booking journey + explicit re-login (covers token issuance twice).
    Asserts DB-backed state transitions enforced by booking_service.
    """
    vendor = _register_vendor(api_client, it_emails["vendor"])
    v_headers = _auth_headers(vendor["access_token"])
    create_resp = api_client.post(
        "/api/v1/openings",
        headers=v_headers,
        json=_opening_json(staff_name="Jordan", title="UC2 Bookable"),
    )
    assert create_resp.status_code == 200, create_resp.text
    opening_id = create_resp.json()["opening_id"]

    reg = _register_client(api_client, it_emails["client_a"], display_name="Booker")
    login = _login(api_client, it_emails["client_a"], "Integration1!")
    assert login.status_code == 200, login.text
    login_body = login.json()
    assert login_body["account_id"] == reg["account_id"]
    c_headers = _auth_headers(login_body["access_token"])

    hold = api_client.post(
        "/api/v1/reservations/hold",
        headers=c_headers,
        json={"opening_id": opening_id},
    )
    assert hold.status_code == 200, hold.text
    hold_body = hold.json()
    assert hold_body["status"] == "HOLD"
    assert hold_body["opening_id"] == opening_id
    reservation_id = hold_body["reservation_id"]
    assert hold_body.get("hold_expires_at") is not None

    opening_after = api_client.get(f"/api/v1/openings/{opening_id}", headers=c_headers)
    assert opening_after.status_code == 200, opening_after.text
    assert opening_after.json()["status"] == "ON_HOLD"

    confirm = api_client.post(
        f"/api/v1/reservations/{reservation_id}/confirm",
        headers=c_headers,
    )
    assert confirm.status_code == 200, confirm.text
    conf_body = confirm.json()
    assert conf_body["status"] == "CONFIRMED"
    assert conf_body["confirmed_at"] is not None

    opening_booked = api_client.get(f"/api/v1/openings/{opening_id}", headers=c_headers)
    assert opening_booked.status_code == 200
    assert opening_booked.json()["status"] == "BOOKED"


# ---------------------------------------------------------------------------
# IT-SDS-UC1-02 — Overlapping active opening rejected (409)
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC1_02_post_opening_rejected_on_overlap(
    api_client,
    it_emails,
):
    """UC1 extension: second active slot for same staff overlapping time window → 409."""
    vendor = _register_vendor(api_client, it_emails["vendor"])
    v_headers = _auth_headers(vendor["access_token"])

    base = 96.0
    first = api_client.post(
        "/api/v1/openings",
        headers=v_headers,
        json=_opening_json(staff_name="Sam", title="First", start_offset_hours=base, duration_hours=2.0),
    )
    assert first.status_code == 200, first.text

    starts_a, ends_a, listing_a = _opening_window(start_offset_hours=base + 0.25, duration_hours=2.0)
    overlap_payload = {
        "staff_name": "Sam",
        "title": "Overlap",
        "description": "integration",
        "starts_at": starts_a.isoformat(),
        "ends_at": ends_a.isoformat(),
        "listed_price": "30.00",
        "payment_option": "BOTH",
        "listing_expires_at": listing_a.isoformat(),
    }
    second = api_client.post("/api/v1/openings", headers=v_headers, json=overlap_payload)
    assert second.status_code == 409, second.text
    assert "overlap" in second.json()["detail"].lower()


# ---------------------------------------------------------------------------
# IT-SDS-UC2-02 — Second client cannot hold slot already on hold
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC2_02_second_client_hold_rejected_when_slot_on_hold(
    api_client,
    it_emails,
):
    """UC2 extension: concurrent demand — ON_HOLD opening is not available for another hold."""
    vendor = _register_vendor(api_client, it_emails["vendor"])
    v_headers = _auth_headers(vendor["access_token"])
    create_resp = api_client.post(
        "/api/v1/openings",
        headers=v_headers,
        json=_opening_json(staff_name="Taylor", title="Hot Slot"),
    )
    assert create_resp.status_code == 200, create_resp.text
    opening_id = create_resp.json()["opening_id"]

    client_a = _register_client(api_client, it_emails["client_a"])
    a_headers = _auth_headers(client_a["access_token"])
    hold_a = api_client.post(
        "/api/v1/reservations/hold",
        headers=a_headers,
        json={"opening_id": opening_id},
    )
    assert hold_a.status_code == 200, hold_a.text

    client_b = _register_client(api_client, it_emails["client_b"])
    b_headers = _auth_headers(client_b["access_token"])
    hold_b = api_client.post(
        "/api/v1/reservations/hold",
        headers=b_headers,
        json={"opening_id": opening_id},
    )
    assert hold_b.status_code == 409, hold_b.text
    assert "not available" in hold_b.json()["detail"].lower()


# ---------------------------------------------------------------------------
# IT-SDS-UC4-01 — Client reservation history includes confirmed booking
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC4_01_client_lists_reservations_includes_confirmed(
    api_client,
    it_emails,
):
    """UC4: past / current bookings list includes the confirmed reservation from UC2-style flow."""
    vendor = _register_vendor(api_client, it_emails["vendor"])
    v_headers = _auth_headers(vendor["access_token"])
    create_resp = api_client.post(
        "/api/v1/openings",
        headers=v_headers,
        json=_opening_json(staff_name="Riley", title="Archive Me"),
    )
    opening_id = create_resp.json()["opening_id"]

    client = _register_client(api_client, it_emails["client_a"])
    c_headers = _auth_headers(client["access_token"])
    hold = api_client.post(
        "/api/v1/reservations/hold",
        headers=c_headers,
        json={"opening_id": opening_id},
    )
    rid = hold.json()["reservation_id"]
    api_client.post(f"/api/v1/reservations/{rid}/confirm", headers=c_headers)

    mine = api_client.get("/api/v1/reservations/me", headers=c_headers)
    assert mine.status_code == 200, mine.text
    rows = mine.json()
    assert isinstance(rows, list)
    match = next((r for r in rows if r["reservation_id"] == rid), None)
    assert match is not None
    assert match["status"] == "CONFIRMED"
    assert match["opening_id"] == opening_id


# ---------------------------------------------------------------------------
# IT-SDS-UC5-01 — Profile update round-trip
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_UC5_01_client_profile_patch_round_trip(
    api_client,
    it_emails,
):
    """UC5: authenticated user updates profile; subsequent read reflects persisted state."""
    client = _register_client(api_client, it_emails["client_a"], display_name="Before Patch")
    c_headers = _auth_headers(client["access_token"])

    patch = api_client.patch(
        "/api/v1/profiles/me",
        headers=c_headers,
        json={
            "display_name": "After Patch",
            "city": "Boston",
            "phone": "6175550100",
        },
    )
    assert patch.status_code == 200, patch.text
    patched = patch.json()
    assert patched["display_name"] == "After Patch"
    assert patched["city"] == "Boston"

    read_back = api_client.get("/api/v1/profiles/me", headers=c_headers)
    assert read_back.status_code == 200, read_back.text
    body = read_back.json()
    assert body["display_name"] == "After Patch"
    assert body["city"] == "Boston"
    assert body["email"] == it_emails["client_a"]


# ---------------------------------------------------------------------------
# IT-SDS-AUTH-01 — Invalid login rejected; valid login + /me
# ---------------------------------------------------------------------------


@pytest.mark.integration
def test_IT_SDS_AUTH_01_invalid_login_rejected_valid_login_and_me(
    api_client,
    it_emails,
):
    """Cross-cutting auth: wrong password 401; correct password 200; /auth/me matches identity."""
    reg = _register_client(api_client, it_emails["client_a"])
    bad = _login(api_client, it_emails["client_a"], "WrongPassword!")
    assert bad.status_code == 401
    detail = bad.json().get("detail", "")
    assert isinstance(detail, str)
    assert "invalid" in detail.lower()

    good = _login(api_client, it_emails["client_a"], "Integration1!")
    assert good.status_code == 200, good.text
    token = good.json()["access_token"]

    me = api_client.get("/api/v1/auth/me", headers=_auth_headers(token))
    assert me.status_code == 200, me.text
    me_body = me.json()
    assert me_body["email"] == it_emails["client_a"]
    assert me_body["account_id"] == reg["account_id"]
    assert me_body["role"] == "CLIENT"
