-- Migration: Add user_id column to jhm_viewer_act table and create proper mapping

-- Step 1: Add user_id column to jhm_viewer_act table
ALTER TABLE jhm_viewer_act ADD COLUMN user_id TEXT;

-- Step 2: Add foreign key constraint to user table
ALTER TABLE jhm_viewer_act ADD CONSTRAINT fk_viewer_user 
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Note: Viewer account creation is now handled in the application layer
-- (in signup/login pages) rather than via database triggers to ensure
-- proper session handling and error management.

-- Step 5: Link existing users to viewer accounts (if any exist)
-- This assumes you want to link users by email address
UPDATE jhm_viewer_act 
SET user_id = "user".id 
FROM "user" 
WHERE jhm_viewer_act.email_addr = "user".email;

-- Step 6: For any existing users without viewer accounts, create them
INSERT INTO jhm_viewer_act (
    viewer_id,
    user_id,
    account_id,
    first_name,
    last_name,
    street_addr,
    city,
    state,
    zip_code,
    open_date,
    email_addr,
    monthly_fee,
    country_id
)
SELECT 
    'viewer_' || u.id,
    u.id,
    'acc_' || u.id,
    COALESCE(SPLIT_PART(u.name, ' ', 1), 'Unknown'),
    COALESCE(SPLIT_PART(u.name, ' ', 2), 'User'),
    'Address not provided',
    'City not provided',
    'State not provided',
    10001, -- Default zip code (must be > 0)
    CURRENT_DATE,
    u.email,
    0,
    (SELECT country_id FROM jhm_country LIMIT 1)
FROM "user" u
LEFT JOIN jhm_viewer_act v ON v.user_id = u.id
WHERE v.user_id IS NULL;
