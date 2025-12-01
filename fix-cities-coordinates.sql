-- Fix latitude and longitude precision in cities table
-- Run this SQL directly on your database

ALTER TABLE cities 
  ALTER COLUMN latitude TYPE DECIMAL(11, 8),
  ALTER COLUMN longitude TYPE DECIMAL(12, 8);
