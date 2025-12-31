# User Profile Location Columns Update

## Summary

Updated the `user_profiles` table structure to replace the generic `city` column with proper relational columns (`city_id`, `city_name`) and added denormalized name columns (`preferred_state_name`, `preferred_city_name`) for better performance and data consistency.

## Database Changes

### Migration File: `migrations/20250126000001-create-user-profiles-table.js`

**Removed:**
- `city` (VARCHAR(100)) - Generic text field

**Added:**
- `city_id` (INTEGER, nullable) - Foreign key to `cities` table
- `city_name` (VARCHAR(100), nullable) - Denormalized city name for display
- `preferred_state_name` (VARCHAR(255), nullable) - Denormalized preferred state name
- `preferred_city_name` (VARCHAR(100), nullable) - Denormalized preferred city name

**Indexes Added:**
- `idx_user_profiles_city_id` - Index on `city_id` column

## Model Changes

### File: `src/models/UserProfile.js`

**Updated Fields:**
- Removed: `city` field
- Added: `cityId`, `cityName`, `preferredStateName`, `preferredCityName` fields

**Updated Associations:**
- Added `city` association (belongsTo City model via `cityId`)
- Kept associations for foreign keys only (not used for queries to avoid joins)

## Repository Changes

### File: `src/repositories/profileRepository.js`

**Updated Methods:**

1. `getUserWithProfile(userId)`:
   - Changed `city` to `cityId` and `cityName` in attributes
   - Removed joins - uses denormalized `cityName` and `stateName` fields

2. `getPreferredLocation(userId)`:
   - Added `preferredStateName` and `preferredCityName` to attributes
   - Removed joins - uses denormalized name fields for performance

## Service Changes

### File: `src/services/profileService.js`

**Updated Methods:**

1. `updateProfile(userId, profileData, file)`:
   - Changed `city` field handling to `cityId` and `cityName`
   - Added support for both fields in profile updates

2. `getPreferredLocation(userId)`:
   - Added `preferredStateName` and `preferredCityName` to response data
   - Returns denormalized data (no joins)

3. `updatePreferredLocation(userId, locationData)`:
   - Added `preferredStateName` and `preferredCityName` field handling
   - Supports updating all name fields independently

## API Documentation Changes

### File: `API-Docs/profile.md`

**Updated Endpoints:**

1. **PUT /api/profile/me** - Update profile:
   - Changed `city` parameter to `cityId` and `cityName`
   - Updated validation rules
   - Updated examples

2. **GET /api/profile/me/preferred-location**:
   - Added `preferredStateName` and `preferredCityName` to response
   - Removed nested state/city objects (now uses denormalized fields)

3. **PUT /api/profile/me/preferred-location**:
   - Added `preferredStateName` and `preferredCityName` to request body
   - Updated examples and validation rules

## Migration Instructions

### For New Installations:
Run the standard migration:
```bash
npx sequelize-cli db:migrate
```

### For Existing Databases:
Use the provided SQL script to update the schema:
```bash
psql -U your_user -d your_database -f migrations/update-user-profiles-location-columns.sql
```

Or manually run the SQL commands:
```sql
-- Add new columns
ALTER TABLE user_profiles ADD COLUMN city_id INTEGER;
ALTER TABLE user_profiles ADD COLUMN city_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN preferred_state_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN preferred_city_name VARCHAR(100);

-- Add foreign key
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_city_id 
FOREIGN KEY (city_id) REFERENCES cities(id) 
ON UPDATE CASCADE ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_user_profiles_city_id ON user_profiles(city_id);

-- Migrate existing data (if needed)
UPDATE user_profiles SET city_name = city WHERE city IS NOT NULL;

-- Drop old column (after verifying data migration)
ALTER TABLE user_profiles DROP COLUMN city;
```

## Testing

Use the provided test script:
```bash
node test-preferred-location.js
```

Update the `ACCESS_TOKEN` in the script with a valid JWT token before running.

## API Usage Examples

### Update Profile with City:
```bash
curl -X PUT http://localhost:3000/api/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cityId=5" \
  -F "cityName=Pune" \
  -F "stateId=1"
```

### Update Preferred Location:
```bash
curl -X PUT http://localhost:3000/api/profile/me/preferred-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredStateId": 1,
    "preferredStateName": "Maharashtra",
    "preferredCityId": 5,
    "preferredCityName": "Pune",
    "preferredLatitude": 18.5204,
    "preferredLongitude": 73.8567
  }'
```

## Benefits

1. **Performance**: Uses denormalized name fields to avoid joins with states/cities tables
2. **Data Consistency**: City data references the `cities` table via foreign key for validation
3. **Flexibility**: Can store city/state names even without IDs (for custom locations)
4. **Better Queries**: Foreign keys ensure data integrity when IDs are provided
5. **Preferred Location**: Users can specify preferred location with full details
6. **Backward Compatible**: Nullable columns ensure existing records remain valid

## Architecture Decision: Denormalization

**Why denormalized name fields?**
- Profile queries are read-heavy (displayed frequently)
- Avoids expensive joins with states/cities tables on every profile fetch
- State/city names rarely change, making denormalization safe
- Foreign keys still maintain referential integrity when IDs are provided
- Follows the same pattern used elsewhere in the schema (e.g., `state_name` column)

## Notes

- All location fields are nullable to support partial updates
- `cityName`, `preferredStateName`, and `preferredCityName` store denormalized data for performance
- Foreign key constraints ensure data integrity when IDs are provided
- The associations in UserProfile model are defined but not used in queries (for potential future use)
- This approach balances normalization (via FKs) with performance (via denormalized names)
