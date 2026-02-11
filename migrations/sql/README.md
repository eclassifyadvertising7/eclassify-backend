# PostGIS Setup SQL Scripts

These SQL scripts must be run **after** running the Sequelize migrations to complete the PostGIS setup.

## Execution Order

Run these scripts in order using your PostgreSQL client:

### 1. Enable PostGIS Extension
```bash
psql -U your_user -d your_database -f migrations/sql/01-enable-postgis.sql
```

This enables the PostGIS extension and verifies the installation.

### 2. Populate Geography Columns
```bash
psql -U your_user -d your_database -f migrations/sql/02-populate-geography-columns.sql
```

This populates the `location` and `preferred_location` columns from existing `latitude`/`longitude` data.

### 3. Create Triggers
```bash
psql -U your_user -d your_database -f migrations/sql/03-create-triggers.sql
```

This creates triggers to automatically sync geography columns when latitude/longitude values change.

## Complete Setup Process

```bash
# 1. Run Sequelize migrations
npx sequelize-cli db:migrate

# 2. Enable PostGIS
psql -U your_user -d your_database -f migrations/sql/01-enable-postgis.sql

# 3. Populate geography columns
psql -U your_user -d your_database -f migrations/sql/02-populate-geography-columns.sql

# 4. Create triggers
psql -U your_user -d your_database -f migrations/sql/03-create-triggers.sql
```

## Using DATABASE_URL

If you're using a `DATABASE_URL` environment variable:

```bash
# Load environment variables
source .env

# Run scripts
psql $DATABASE_URL -f migrations/sql/01-enable-postgis.sql
psql $DATABASE_URL -f migrations/sql/02-populate-geography-columns.sql
psql $DATABASE_URL -f migrations/sql/03-create-triggers.sql
```

## Verification

After running all scripts, verify the setup:

```sql
-- Check PostGIS version
SELECT PostGIS_version();

-- Check populated geography columns
SELECT 
  'listings' as table_name,
  COUNT(*) as total,
  COUNT(location) as with_location
FROM listings
UNION ALL
SELECT 
  'user_profiles',
  COUNT(*),
  COUNT(preferred_location)
FROM user_profiles;

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%location%';

-- Test spatial query
SELECT COUNT(*) 
FROM listings 
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(73.908681, 18.579016), 4326)::geography,
  200000
);
```

## Notes

- These scripts are idempotent (safe to run multiple times)
- The triggers will automatically maintain geography columns going forward
- No manual sync needed after initial population
