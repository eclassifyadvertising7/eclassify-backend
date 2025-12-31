-- SQL script to update user_profiles table structure
-- Run this if you already have the user_profiles table created

-- Add new columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city_id INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_state_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_city_name VARCHAR(100);

-- Add foreign key constraint for city_id
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_city_id 
FOREIGN KEY (city_id) 
REFERENCES cities(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Add index for city_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_city_id ON user_profiles(city_id);

-- Migrate data from old 'city' column to new 'city_name' column (if city column exists)
-- UPDATE user_profiles SET city_name = city WHERE city IS NOT NULL;

-- Drop old 'city' column (uncomment after data migration)
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS city;

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('city_id', 'city_name', 'preferred_state_name', 'preferred_city_name', 'city')
ORDER BY column_name;
