-- Add total_listings column to users table
-- Run this SQL directly on your database

ALTER TABLE users 
  ADD COLUMN total_listings INTEGER NOT NULL DEFAULT 0;

-- Add comment
COMMENT ON COLUMN users.total_listings IS 'Total number of listings created by user';

-- Update existing users with their current listing count
UPDATE users 
SET total_listings = (
  SELECT COUNT(*) 
  FROM listings 
  WHERE listings.user_id = users.id 
    AND listings.deleted_at IS NULL
);

-- Verify the update
SELECT id, full_name, total_listings 
FROM users 
ORDER BY total_listings DESC 
LIMIT 10;
