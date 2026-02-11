/**
 * Migration: Create PostGIS location triggers
 * 
 * Creates database triggers to automatically populate geography columns
 * from latitude/longitude coordinates for three tables:
 * - locations.location
 * - listings.location
 * - user_profiles.preferred_location
 * 
 * Industry standard approach for PostGIS applications.
 */

export async function up(queryInterface, Sequelize) {
  console.log('Creating PostGIS location triggers...');

  // 1. Create trigger function for locations table
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION sync_locations_location()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Create trigger for locations table
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_sync_locations_location
      BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
      FOR EACH ROW
      EXECUTE FUNCTION sync_locations_location();
  `);

  console.log('✓ Created trigger for locations table');

  // 3. Create trigger function for listings table
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION sync_listings_location()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 4. Create trigger for listings table
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_sync_listings_location
      BEFORE INSERT OR UPDATE OF latitude, longitude ON listings
      FOR EACH ROW
      EXECUTE FUNCTION sync_listings_location();
  `);

  console.log('✓ Created trigger for listings table');

  // 5. Create trigger function for user_profiles table
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION sync_user_profiles_preferred_location()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.preferred_latitude IS NOT NULL AND NEW.preferred_longitude IS NOT NULL THEN
        NEW.preferred_location = ST_SetSRID(ST_MakePoint(NEW.preferred_longitude, NEW.preferred_latitude), 4326)::geography;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 6. Create trigger for user_profiles table
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_sync_user_profiles_preferred_location
      BEFORE INSERT OR UPDATE OF preferred_latitude, preferred_longitude ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION sync_user_profiles_preferred_location();
  `);

  console.log('✓ Created trigger for user_profiles table');

  // 7. Backfill existing records - locations table
  console.log('Backfilling existing records...');
  
  await queryInterface.sequelize.query(`
    UPDATE locations
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL 
      AND location IS NULL;
  `);

  console.log('✓ Backfilled locations table');

  // 8. Backfill existing records - listings table
  await queryInterface.sequelize.query(`
    UPDATE listings
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL 
      AND location IS NULL;
  `);

  console.log('✓ Backfilled listings table');

  // 9. Backfill existing records - user_profiles table
  await queryInterface.sequelize.query(`
    UPDATE user_profiles
    SET preferred_location = ST_SetSRID(ST_MakePoint(preferred_longitude, preferred_latitude), 4326)::geography
    WHERE preferred_latitude IS NOT NULL 
      AND preferred_longitude IS NOT NULL 
      AND preferred_location IS NULL;
  `);

  console.log('✓ Backfilled user_profiles table');

  // 10. Verify triggers were created
  const [triggers] = await queryInterface.sequelize.query(`
    SELECT 
      trigger_name,
      event_object_table,
      action_timing,
      event_manipulation
    FROM information_schema.triggers
    WHERE trigger_name IN (
      'trigger_sync_locations_location',
      'trigger_sync_listings_location',
      'trigger_sync_user_profiles_preferred_location'
    )
    ORDER BY event_object_table, trigger_name;
  `);

  console.log('\n✓ Migration completed successfully!');
  console.log('Created triggers:', triggers.length);
  triggers.forEach(t => {
    console.log(`  - ${t.trigger_name} on ${t.event_object_table}`);
  });
}

export async function down(queryInterface, Sequelize) {
  console.log('Dropping PostGIS location triggers...');

  // Drop triggers
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_sync_locations_location ON locations;
  `);

  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_sync_listings_location ON listings;
  `);

  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_sync_user_profiles_preferred_location ON user_profiles;
  `);

  console.log('✓ Dropped all triggers');

  // Drop trigger functions
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS sync_locations_location;
  `);

  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS sync_listings_location;
  `);

  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS sync_user_profiles_preferred_location;
  `);

  console.log('✓ Dropped all trigger functions');
  console.log('✓ Rollback completed successfully!');
}
