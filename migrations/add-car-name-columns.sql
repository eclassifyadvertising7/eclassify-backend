-- Add denormalized name columns to car_listings table
-- Run this SQL directly on your database

-- Add brand_name column
ALTER TABLE car_listings 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(100);

-- Add model_name column
ALTER TABLE car_listings 
ADD COLUMN IF NOT EXISTS model_name VARCHAR(100);

-- Add variant_name column
ALTER TABLE car_listings 
ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100);

-- Populate existing data from related tables
UPDATE car_listings cl
SET 
  brand_name = cb.name,
  model_name = cm.name,
  variant_name = cv.name
FROM car_brands cb
LEFT JOIN car_models cm ON cl.model_id = cm.id
LEFT JOIN car_variants cv ON cl.variant_id = cv.id
WHERE cl.brand_id = cb.id;

-- Make brand_name and model_name NOT NULL after populating data
ALTER TABLE car_listings 
ALTER COLUMN brand_name SET NOT NULL;

ALTER TABLE car_listings 
ALTER COLUMN model_name SET NOT NULL;

-- Add indexes for faster search queries
CREATE INDEX IF NOT EXISTS idx_car_listings_brand_name 
ON car_listings(brand_name);

CREATE INDEX IF NOT EXISTS idx_car_listings_model_name 
ON car_listings(model_name);

-- Add comments for documentation
COMMENT ON COLUMN car_listings.brand_name IS 'Denormalized brand name for faster queries';
COMMENT ON COLUMN car_listings.model_name IS 'Denormalized model name for faster queries';
COMMENT ON COLUMN car_listings.variant_name IS 'Denormalized variant name for faster queries';
