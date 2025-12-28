-- Add plot dimension columns and make columns nullable for plot type
-- Run this SQL directly on your database

-- Make columns nullable for plot type
ALTER TABLE property_listings 
ALTER COLUMN balconies DROP NOT NULL,
ALTER COLUMN balconies DROP DEFAULT;

ALTER TABLE property_listings 
ALTER COLUMN furnished DROP NOT NULL,
ALTER COLUMN furnished DROP DEFAULT;

ALTER TABLE property_listings 
ALTER COLUMN parking_spaces DROP NOT NULL,
ALTER COLUMN parking_spaces DROP DEFAULT;

-- Add plot dimension columns
ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS plot_length_ft DECIMAL(10,2) NULL;

ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS plot_width_ft DECIMAL(10,2) NULL;

ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS plot_elevation_ft DECIMAL(10,2) NULL;

-- Add JSONB column for additional property details
ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS other_details JSONB NULL;

-- Add comments for documentation
COMMENT ON COLUMN property_listings.plot_length_ft IS 'Plot length in feet (for plots/land)';
COMMENT ON COLUMN property_listings.plot_width_ft IS 'Plot width in feet (for plots/land)';
COMMENT ON COLUMN property_listings.plot_elevation_ft IS 'Plot elevation/height in feet (for plots/land)';
COMMENT ON COLUMN property_listings.other_details IS 'Additional property-specific details: plot boundaries, utilities, soil, zoning, etc.';

-- Example other_details JSONB structure:
-- {
--   "boundaryWall": true,
--   "boundaryWallType": "compound",
--   "cornerPlot": false,
--   "gatedCommunity": true,
--   "soilType": "red",
--   "landZone": "residential",
--   "waterConnection": true,
--   "electricityConnection": true,
--   "sewageConnection": false,
--   "roadAccess": true,
--   "roadWidthFt": 30,
--   "approvedForConstruction": true,
--   "constructionAllowed": true,
--   "fsiFsr": 1.5,
--   "maxFloorsAllowed": 4,
--   "plotStatus": "vacant",
--   "clearTitle": true
-- }
