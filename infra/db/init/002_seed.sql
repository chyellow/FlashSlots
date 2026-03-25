-- 002_seed.sql
-- Safe to rerun locally for Alpha demo data

BEGIN;

-- ---------- accounts ----------
INSERT INTO accounts (email, password_hash, role)
VALUES
    ('client@test.com', 'devhash', 'CLIENT'),
    ('biz@test.com', 'devhash', 'BUSINESS')
    ON CONFLICT (email) DO NOTHING;

-- ---------- profiles ----------
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

-- ---------- business ----------
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
    'Alpha demo business for FlashSlots',
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

-- ---------- openings ----------
-- one OPEN opening
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
    'Alpha demo opening currently available',
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

-- one EXPIRED opening
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
    'Alpha demo opening already expired',
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

COMMIT;