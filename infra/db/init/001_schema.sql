-- 001_schema.sql
-- FlashSlots baseline schema
-- Beta-ready with minimal changes
-- Safe to rerun locally

BEGIN;

-- Automatically update updated_at on row updates
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- accounts
-- =========================
CREATE TABLE IF NOT EXISTS accounts (
                                        account_id BIGSERIAL PRIMARY KEY,
                                        email TEXT NOT NULL UNIQUE,
                                        password_hash TEXT NOT NULL,
                                        role TEXT NOT NULL CHECK (role IN ('CLIENT', 'BUSINESS', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- =========================
-- profiles
-- =========================
CREATE TABLE IF NOT EXISTS profiles (
                                        profile_id BIGSERIAL PRIMARY KEY,
                                        account_id BIGINT NOT NULL UNIQUE
                                        REFERENCES accounts(account_id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    state_region TEXT,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- =========================
-- businesses
-- =========================
CREATE TABLE IF NOT EXISTS businesses (
                                          business_id BIGSERIAL PRIMARY KEY,
                                          owner_account_id BIGINT NOT NULL UNIQUE
                                          REFERENCES accounts(account_id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    address_line1 TEXT NOT NULL,
    city TEXT NOT NULL,
    state_region TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    latitude DOUBLE PRECISION
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    longitude DOUBLE PRECISION
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    timezone TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    default_payment_option TEXT NOT NULL DEFAULT 'BOTH'
    CHECK (default_payment_option IN ('CARD', 'CASH', 'BOTH')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- =========================
-- openings
-- =========================
CREATE TABLE IF NOT EXISTS openings (
                                        opening_id BIGSERIAL PRIMARY KEY,
                                        business_id BIGINT NOT NULL
                                        REFERENCES businesses(business_id) ON DELETE CASCADE,
    posted_by_account_id BIGINT NOT NULL
    REFERENCES accounts(account_id) ON DELETE RESTRICT,
    staff_name TEXT,
    title TEXT,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    listed_price NUMERIC(10, 2) NOT NULL CHECK (listed_price >= 0),
    payment_option TEXT NOT NULL
    CHECK (payment_option IN ('CARD', 'CASH', 'BOTH')),
    status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'ON_HOLD', 'BOOKED', 'EXPIRED', 'CANCELLED')),
    listing_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    CHECK (ends_at > starts_at),
    CHECK (listing_expires_at <= starts_at)
    );

CREATE INDEX IF NOT EXISTS idx_openings_feed
    ON openings (status, listing_expires_at);

CREATE INDEX IF NOT EXISTS idx_openings_business_time
    ON openings (business_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_openings_starts_at
    ON openings (starts_at);

CREATE INDEX IF NOT EXISTS idx_openings_posted_by_status
    ON openings (posted_by_account_id, status, starts_at);

-- =========================
-- reservations
-- =========================
CREATE TABLE IF NOT EXISTS reservations (
                                            reservation_id BIGSERIAL PRIMARY KEY,
                                            opening_id BIGINT NOT NULL UNIQUE
                                            REFERENCES openings(opening_id) ON DELETE CASCADE,
    client_account_id BIGINT NOT NULL
    REFERENCES accounts(account_id) ON DELETE RESTRICT,
    status TEXT NOT NULL
    CHECK (status IN (
           'HOLD',
           'CONFIRMED',
           'CANCELLED_BY_CLIENT',
           'CANCELLED_BY_BUSINESS',
           'HOLD_EXPIRED',
           'COMPLETED'
                     )),
    hold_expires_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_by_account_id BIGINT
    REFERENCES accounts(account_id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ((status <> 'HOLD') OR hold_expires_at IS NOT NULL),
    CHECK ((status <> 'COMPLETED') OR completed_at IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS idx_res_hold_expiry
    ON reservations (status, hold_expires_at);

CREATE INDEX IF NOT EXISTS idx_res_client_time
    ON reservations (client_account_id, created_at);

CREATE INDEX IF NOT EXISTS idx_res_opening
    ON reservations (opening_id);

CREATE INDEX IF NOT EXISTS idx_res_status_created
    ON reservations (status, created_at);

-- =========================
-- enforce unique reservation per opening for active reservations
-- =========================
DROP INDEX IF EXISTS uq_opening_active_reservations;

CREATE UNIQUE INDEX uq_opening_active_reservations
    ON reservations(opening_id)
    WHERE status IN ('HOLD', 'CONFIRMED');

-- =========================
-- updated_at triggers
-- =========================
DROP TRIGGER IF EXISTS trg_accounts_set_updated_at ON accounts;
CREATE TRIGGER trg_accounts_set_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON profiles;
CREATE TRIGGER trg_profiles_set_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_businesses_set_updated_at ON businesses;
CREATE TRIGGER trg_businesses_set_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_openings_set_updated_at ON openings;
CREATE TRIGGER trg_openings_set_updated_at
    BEFORE UPDATE ON openings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_set_updated_at ON reservations;
CREATE TRIGGER trg_reservations_set_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;