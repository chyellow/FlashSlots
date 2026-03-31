-- 002_seed.sql
-- Safe to rerun locally for Beta demo data

BEGIN;

-- =========================
-- accounts
-- =========================
INSERT INTO accounts (email, password_hash, role)
VALUES
    ('client@test.com', 'devhash', 'CLIENT'),
    ('biz@test.com', 'devhash', 'BUSINESS')
    ON CONFLICT (email) DO NOTHING;

-- =========================
-- profiles
-- =========================
INSERT INTO profiles (account_id, display_name, phone, city, state_region, username)
SELECT
    a.account_id,
    'Test Client',
    '(732) 555-0912',
    'Piscataway',
    'NJ',
    'client'
FROM accounts a
WHERE a.email = 'client@test.com'
    ON CONFLICT (account_id) DO NOTHING;

INSERT INTO profiles (account_id, display_name, phone, city, state_region, username)
SELECT
    a.account_id,
    'Test Barber',
    '(609) 254-1312',
    'New Brunswick',
    'NJ',
    'vendor'
FROM accounts a
WHERE a.email = 'biz@test.com'
    ON CONFLICT (account_id) DO NOTHING;

-- =========================
-- business
-- =========================
INSERT INTO businesses (
    owner_account_id,
    display_name,
    description,
    address_line1,
    city,
    state_region,
    postal_code,
    latitude,
    longitude,
    timezone,
    verification_status,
    default_payment_option
)
SELECT
    a.account_id,
    'Test Barber Shop',
    'Beta demo business for FlashSlots',
    '123 Main St',
    'Boston',
    'MA',
    '02115',
    42.3429,
    -71.1003,
    'America/New_York',
    'VERIFIED',
    'BOTH'
FROM accounts a
WHERE a.email = 'biz@test.com'
    ON CONFLICT (owner_account_id) DO NOTHING;

-- =========================
-- openings
-- =========================

-- OPEN opening for live feed / hold demo
INSERT INTO openings (
    business_id,
    posted_by_account_id,
    staff_name,
    title,
    description,
    starts_at,
    ends_at,
    listed_price,
    payment_option,
    status,
    listing_expires_at
)
SELECT
    b.business_id,
    a.account_id,
    'Alex',
    'Haircut - Flash Slot',
    'Available opening for live feed / hold demo',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '3 hours',
    25.00,
    'BOTH',
    'OPEN',
    NOW() + INTERVAL '90 minutes'
FROM businesses b
    JOIN accounts a ON a.account_id = b.owner_account_id
WHERE b.display_name = 'Test Barber Shop'
  AND NOT EXISTS (
    SELECT 1
    FROM openings o
    WHERE o.business_id = b.business_id
  AND o.title = 'Haircut - Flash Slot'
    );

-- EXPIRED opening
INSERT INTO openings (
    business_id,
    posted_by_account_id,
    staff_name,
    title,
    description,
    starts_at,
    ends_at,
    listed_price,
    payment_option,
    status,
    listing_expires_at
)
SELECT
    b.business_id,
    a.account_id,
    'Alex',
    'Expired Slot',
    'Already expired demo slot',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours',
    20.00,
    'BOTH',
    'EXPIRED',
    NOW() - INTERVAL '4 hours'
FROM businesses b
    JOIN accounts a ON a.account_id = b.owner_account_id
WHERE b.display_name = 'Test Barber Shop'
  AND NOT EXISTS (
    SELECT 1
    FROM openings o
    WHERE o.business_id = b.business_id
  AND o.title = 'Expired Slot'
    );

-- BOOKED opening for current reservation demo
INSERT INTO openings (
    business_id,
    posted_by_account_id,
    staff_name,
    title,
    description,
    starts_at,
    ends_at,
    listed_price,
    payment_option,
    status,
    listing_expires_at
)
SELECT
    b.business_id,
    a.account_id,
    'Jordan',
    'Booked Slot',
    'Booked demo slot',
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '5 hours',
    30.00,
    'CARD',
    'BOOKED',
    NOW() + INTERVAL '3 hours'
FROM businesses b
    JOIN accounts a ON a.account_id = b.owner_account_id
WHERE b.display_name = 'Test Barber Shop'
  AND NOT EXISTS (
    SELECT 1
    FROM openings o
    WHERE o.business_id = b.business_id
  AND o.title = 'Booked Slot'
    );

-- COMPLETED opening for archive demo
INSERT INTO openings (
    business_id,
    posted_by_account_id,
    staff_name,
    title,
    description,
    starts_at,
    ends_at,
    listed_price,
    payment_option,
    status,
    listing_expires_at
)
SELECT
    b.business_id,
    a.account_id,
    'Taylor',
    'Completed Slot',
    'Completed reservation archive demo',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '1 hour',
    28.00,
    'CASH',
    'BOOKED',
    NOW() - INTERVAL '2 days' - INTERVAL '30 minutes'
FROM businesses b
    JOIN accounts a ON a.account_id = b.owner_account_id
WHERE b.display_name = 'Test Barber Shop'
  AND NOT EXISTS (
    SELECT 1
    FROM openings o
    WHERE o.business_id = b.business_id
  AND o.title = 'Completed Slot'
    );

-- =========================
-- reservations
-- =========================

-- CONFIRMED reservation for booked slot
INSERT INTO reservations (
    opening_id,
    client_account_id,
    status,
    confirmed_at
)
SELECT
    o.opening_id,
    a.account_id,
    'CONFIRMED',
    NOW()
FROM openings o
         JOIN accounts a ON a.email = 'client@test.com'
WHERE o.title = 'Booked Slot'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r WHERE r.opening_id = o.opening_id
);

-- COMPLETED reservation for archive demo
INSERT INTO reservations (
    opening_id,
    client_account_id,
    status,
    confirmed_at,
    completed_at
)
SELECT
    o.opening_id,
    a.account_id,
    'COMPLETED',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '1 hour'
FROM openings o
    JOIN accounts a ON a.email = 'client@test.com'
WHERE o.title = 'Completed Slot'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r WHERE r.opening_id = o.opening_id
    );

COMMIT;