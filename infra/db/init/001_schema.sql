CREATE TABLE accounts
(
    account_id    BIGSERIAL PRIMARY KEY,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL CHECK (role IN ('CLIENT', 'BUSINESS', 'ADMIN')),
    status        TEXT        NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles
(
    profile_id   BIGSERIAL PRIMARY KEY,
    account_id   BIGINT      NOT NULL UNIQUE REFERENCES accounts (account_id) ON DELETE CASCADE,
    display_name TEXT        NOT NULL,
    phone        TEXT,
    city         TEXT,
    state_region TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE businesses
(
    business_id            BIGSERIAL PRIMARY KEY,
    owner_account_id       BIGINT      NOT NULL UNIQUE REFERENCES accounts (account_id) ON DELETE CASCADE,
    display_name           TEXT        NOT NULL,
    description            TEXT,
    address_line1          TEXT        NOT NULL,
    city                   TEXT        NOT NULL,
    state_region           TEXT        NOT NULL,
    postal_code            TEXT        NOT NULL,
    latitude               DOUBLE PRECISION,
    longitude              DOUBLE PRECISION,
    timezone               TEXT        NOT NULL,
    verification_status    TEXT        NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    default_payment_option TEXT        NOT NULL DEFAULT 'BOTH' CHECK (default_payment_option IN ('CARD', 'CASH', 'BOTH')),
    is_active              BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE openings
(
    opening_id           BIGSERIAL PRIMARY KEY,
    business_id          BIGINT         NOT NULL REFERENCES businesses (business_id) ON DELETE CASCADE,
    posted_by_account_id BIGINT         NOT NULL REFERENCES accounts (account_id) ON DELETE RESTRICT,
    staff_name           TEXT,
    title                TEXT,
    description          TEXT,
    starts_at            TIMESTAMPTZ    NOT NULL,
    ends_at              TIMESTAMPTZ    NOT NULL,
    listed_price         NUMERIC(10, 2) NOT NULL CHECK (listed_price >= 0),
    payment_option       TEXT           NOT NULL CHECK (payment_option IN ('CARD', 'CASH', 'BOTH')),
    status               TEXT           NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ON_HOLD', 'BOOKED', 'EXPIRED', 'CANCELLED')),
    listing_expires_at   TIMESTAMPTZ    NOT NULL,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    version              INT            NOT NULL DEFAULT 1,
    CHECK (ends_at > starts_at)
);

CREATE INDEX idx_openings_feed ON openings (status, listing_expires_at);
CREATE INDEX idx_openings_business_time ON openings (business_id, starts_at);

CREATE TABLE reservations
(
    reservation_id          BIGSERIAL PRIMARY KEY,
    opening_id              BIGINT      NOT NULL UNIQUE REFERENCES openings (opening_id) ON DELETE CASCADE,
    client_account_id       BIGINT      NOT NULL REFERENCES accounts (account_id) ON DELETE RESTRICT,
    status                  TEXT        NOT NULL CHECK (status IN ('HOLD', 'CONFIRMED', 'CANCELLED_BY_CLIENT',
                                                                   'CANCELLED_BY_BUSINESS', 'HOLD_EXPIRED',
                                                                   'COMPLETED')),
    hold_expires_at         TIMESTAMPTZ,
    confirmed_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    cancelled_by_account_id BIGINT      REFERENCES accounts (account_id) ON DELETE SET NULL,
    cancellation_reason     TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_res_hold_expiry ON reservations (status, hold_expires_at);
CREATE INDEX idx_res_client_time ON reservations (client_account_id, created_at);