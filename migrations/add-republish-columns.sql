-- Add republish tracking columns to listings table
-- Run this SQL directly on your database

-- Add republish_count column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS republish_count INT NOT NULL DEFAULT 0;

-- Add last_republished_at column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS last_republished_at TIMESTAMP NULL;

-- Add republish_history column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS republish_history JSONB NULL;

-- Add index for last_republished_at
CREATE INDEX IF NOT EXISTS idx_listings_last_republished_at 
ON listings(last_republished_at);

-- Add comments for documentation
COMMENT ON COLUMN listings.republish_count IS 'Total number of times listing has been republished';
COMMENT ON COLUMN listings.last_republished_at IS 'Timestamp of most recent republish action';
COMMENT ON COLUMN listings.republish_history IS 'JSON array tracking republish history with timestamps and metadata';

-- Drop old columns if they exist (from previous implementation)
ALTER TABLE listings DROP COLUMN IF EXISTS republished_at;
DROP INDEX IF EXISTS idx_listings_republished_at;
DROP INDEX IF EXISTS idx_listings_republish_count;
