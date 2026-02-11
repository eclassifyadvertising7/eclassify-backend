-- Populate location column in listings table from existing latitude/longitude
UPDATE listings 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Populate preferred_location column in user_profiles table
UPDATE user_profiles 
SET preferred_location = ST_SetSRID(ST_MakePoint(preferred_longitude, preferred_latitude), 4326)::geography
WHERE preferred_latitude IS NOT NULL AND preferred_longitude IS NOT NULL;

-- Verify population
SELECT 
  'listings' as table_name,
  COUNT(*) as total_rows,
  COUNT(location) as rows_with_location,
  COUNT(*) - COUNT(location) as rows_without_location
FROM listings
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(preferred_location) as rows_with_location,
  COUNT(*) - COUNT(preferred_location) as rows_without_location
FROM user_profiles;
