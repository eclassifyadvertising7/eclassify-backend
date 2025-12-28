-- Add referral fields to users table
-- Run this SQL directly on your database

ALTER TABLE users 
ADD COLUMN referral_code VARCHAR(20) UNIQUE,
ADD COLUMN referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN referral_count INT DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name IN ('referral_code', 'referred_by', 'referral_count');
