-- Clear cities and states tables
-- Run this SQL directly on your database

TRUNCATE TABLE cities CASCADE;
TRUNCATE TABLE states CASCADE;

-- Reset sequences (optional, if you want IDs to start from 1 again)
ALTER SEQUENCE cities_id_seq RESTART WITH 1;
ALTER SEQUENCE states_id_seq RESTART WITH 1;
