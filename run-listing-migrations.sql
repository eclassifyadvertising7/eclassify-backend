-- Run Listing Migrations
-- Execute these commands in order after ensuring all dependencies exist

-- Step 1: Verify dependencies exist
-- Required tables: users, categories, states, cities, car_brands, car_models, car_variants

-- Check if required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'states', 'cities', 'car_brands', 'car_models', 'car_variants');

-- Step 2: Run migrations using Sequelize CLI
-- npx sequelize-cli db:migrate --to 20250310000001-create-listings-table.js
-- npx sequelize-cli db:migrate --to 20250315000001-create-car-listings-table.js
-- npx sequelize-cli db:migrate --to 20250320000001-create-property-listings-table.js
-- npx sequelize-cli db:migrate --to 20250325000001-create-listing-media-table.js

-- Or run all pending migrations:
-- npx sequelize-cli db:migrate

-- Step 3: Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('listings', 'car_listings', 'property_listings', 'listing_media');

-- Step 4: Verify indexes were created
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('listings', 'car_listings', 'property_listings', 'listing_media')
ORDER BY tablename, indexname;

-- Step 5: Verify foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('listings', 'car_listings', 'property_listings', 'listing_media')
ORDER BY tc.table_name, kcu.column_name;

-- Step 6: Check table structure
\d listings
\d car_listings
\d property_listings
\d listing_media
