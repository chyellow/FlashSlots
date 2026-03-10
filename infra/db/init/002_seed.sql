--Example entries for alpha release

INSERT INTO accounts (email, password_hash, role)
VALUES ('client@test.com', 'devhash', 'CLIENT'),
       ('biz@test.com', 'devhash', 'BUSINESS');

INSERT INTO profiles (account_id, display_name, phone, city, state_region, username)
SELECT account_id, 'Test Client', '(732) 555-0912', 'Piscataway', 'NJ', 'client'
FROM accounts WHERE email = 'client@test.com';

INSERT INTO profiles (account_id, display_name, phone, city, state_region, username)
SELECT account_id, 'Test Barber', '(609) 254-1312', 'New Brunswick', 'NJ', 'vendor'
FROM accounts WHERE email = 'biz@test.com';

INSERT INTO businesses (owner_account_id, display_name, address_line1, city, state_region, postal_code, timezone,
                        verification_status)
SELECT account_id,
       'Test Barber Shop',
       '123 Main St',
       'Boston',
       'MA',
       '02115',
       'America/New_York',
       'VERIFIED'
FROM accounts
WHERE email = 'biz@test.com';

-- Create two openings for robustness and provability for alpha: one OPEN, one EXPIRED
INSERT INTO openings (business_id, posted_by_account_id, staff_name, title, starts_at, ends_at, listed_price,
                      payment_option, status, listing_expires_at)
SELECT b.business_id,
       a.account_id,
       'Alex',
       'Haircut - Flash Slot',
       NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 25.00, 'BOTH', 'OPEN', NOW() + INTERVAL '90 minutes'
FROM businesses b
    JOIN accounts a
ON a.account_id = b.owner_account_id
    LIMIT 1;

INSERT INTO openings (business_id, posted_by_account_id, staff_name, title, starts_at, ends_at, listed_price,
                      payment_option, status, listing_expires_at)
SELECT b.business_id,
       a.account_id,
       'Alex',
       'Expired Slot',
       NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 20.00, 'BOTH', 'EXPIRED', NOW() - INTERVAL '4 hours'
FROM businesses b
    JOIN accounts a
ON a.account_id = b.owner_account_id
    LIMIT 1;