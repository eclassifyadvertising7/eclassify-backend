-- Rename plot_details to other_details in property_listings table
-- Run this SQL directly on your database if you have the old column name

-- Check if plot_details column exists and rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'property_listings' 
        AND column_name = 'plot_details'
    ) THEN
        ALTER TABLE property_listings 
        RENAME COLUMN plot_details TO other_details;
        
        RAISE NOTICE 'Column plot_details renamed to other_details';
    ELSE
        RAISE NOTICE 'Column plot_details does not exist, no action needed';
    END IF;
END $$;

-- Update comment
COMMENT ON COLUMN property_listings.other_details IS 'Additional property-specific details: plot boundaries, utilities, soil, zoning, etc.';
