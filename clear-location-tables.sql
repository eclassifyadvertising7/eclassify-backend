-- Clear cities and states tables
-- Run this SQL directly on your database

-- Must delete cities first (child table)
TRUNCATE TABLE cities RESTART IDENTITY CASCADE;

-- Then delete states (parent table)
TRUNCATE TABLE states RESTART IDENTITY CASCADE;

-- Verify tables are empty
SELECT COUNT(*) as cities_count FROM cities;
SELECT COUNT(*) as states_count FROM states;
