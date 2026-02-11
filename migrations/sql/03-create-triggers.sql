-- Trigger function for listings table
CREATE OR REPLACE FUNCTION sync_listings_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for listings
CREATE TRIGGER trigger_sync_listings_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON listings
  FOR EACH ROW
  EXECUTE FUNCTION sync_listings_location();

-- Trigger function for user_profiles table
CREATE OR REPLACE FUNCTION sync_user_profiles_preferred_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preferred_latitude IS NOT NULL AND NEW.preferred_longitude IS NOT NULL THEN
    NEW.preferred_location = ST_SetSRID(ST_MakePoint(NEW.preferred_longitude, NEW.preferred_latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
CREATE TRIGGER trigger_sync_user_profiles_preferred_location
  BEFORE INSERT OR UPDATE OF preferred_latitude, preferred_longitude ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profiles_preferred_location();

-- Trigger function for locations table
CREATE OR REPLACE FUNCTION sync_locations_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for locations
CREATE TRIGGER trigger_sync_locations_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
  FOR EACH ROW
  EXECUTE FUNCTION sync_locations_location();

-- Verify triggers
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%location%'
ORDER BY event_object_table, trigger_name;
