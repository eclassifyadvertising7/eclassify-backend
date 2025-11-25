-- Fix: Increase ip_address_v4 column size to handle IPv6-mapped addresses
-- VARCHAR(15) is too small for ::ffff:127.0.0.1 (16 chars)
-- VARCHAR(45) can handle both IPv4 and IPv6 addresses

ALTER TABLE user_sessions ALTER COLUMN ip_address_v4 TYPE VARCHAR(45);

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name = 'ip_address_v4';
