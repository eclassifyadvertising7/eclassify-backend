-- Add category_type column to listings table
-- Run this SQL directly on your database

-- Create ENUM type for category_type
DO $$ BEGIN
    CREATE TYPE listing_category_type AS ENUM ('car', 'property');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add category_type column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS category_type listing_category_type;

-- Populate existing data based on category slug
UPDATE listings l
SET category_type = CASE 
    WHEN c.slug = 'cars' THEN 'car'::listing_category_type
    WHEN c.slug = 'properties' THEN 'property'::listing_category_type
    ELSE NULL
END
FROM categories c
WHERE l.category_id = c.id
AND l.category_type IS NULL;

-- Make column NOT NULL after populating data
ALTER TABLE listings 
ALTER COLUMN category_type SET NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_category_type 
ON listings(category_type);

-- Add comment for documentation
COMMENT ON COLUMN listings.category_type IS 'Denormalized category type for faster queries';
