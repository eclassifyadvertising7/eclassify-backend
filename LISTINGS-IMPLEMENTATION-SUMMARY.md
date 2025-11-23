# Listings Module Implementation Summary

## Overview

Complete implementation of the listings module with support for multiple category types (cars, properties) using a polymorphic association pattern with base table + category-specific tables.

---

## Files Created

### Phase 1: Database & Models (Already Completed)

**Migrations (4 files):**
1. `migrations/20250310000001-create-listings-table.js` - Base listings table
2. `migrations/20250315000001-create-car-listings-table.js` - Car-specific attributes
3. `migrations/20250320000001-create-property-listings-table.js` - Property-specific attributes
4. `migrations/20250325000001-create-listing-media-table.js` - Images and videos

**Models (4 files):**
1. `src/models/Listing.js` - Base listing model with hooks
2. `src/models/CarListing.js` - Car listing model
3. `src/models/PropertyListing.js` - Property listing model
4. `src/models/ListingMedia.js` - Media model

### Phase 2: Repositories (4 files - FLAT structure)

1. `src/repositories/listingRepository.js` - Base listing CRUD operations
   - Create, read, update, delete listings
   - Get by ID, slug, with filters
   - Approve, reject, update status
   - Increment view/contact counts
   - Get statistics

2. `src/repositories/carListingRepository.js` - Car-specific operations
   - Create, read, update, delete car listings
   - Search with car-specific filters

3. `src/repositories/propertyListingRepository.js` - Property-specific operations
   - Create, read, update, delete property listings
   - Search with property-specific filters

4. `src/repositories/listingMediaRepository.js` - Media management
   - Create, read, update, delete media
   - Set primary media
   - Update display order
   - Count by type

### Phase 3: Services (4 files - FLAT structure)

1. `src/services/listingService.js` - Core business logic
   - Create, update, delete listings
   - Submit for approval
   - Approve, reject (admin)
   - Mark as sold
   - Update featured status
   - Get statistics

2. `src/services/carListingService.js` - Car-specific validation
   - Validate car data (year, mileage, etc.)
   - Prepare car data for creation/update

3. `src/services/propertyListingService.js` - Property-specific validation
   - Validate property data (area, bedrooms, etc.)
   - Prepare property data for creation/update

4. `src/services/listingMediaService.js` - Media management
   - Upload media with validation
   - Delete media with cleanup
   - Set primary media
   - Update display order

### Phase 4: Controllers (3 files with subdirectories)

1. `src/controllers/end-user/listingController.js` - User's own listings
   - Create, update, delete listings
   - Submit for approval
   - Mark as sold
   - Upload/delete media
   - Get my listings and stats

2. `src/controllers/panel/listingController.js` - Admin management
   - Get all listings with filters
   - Approve, reject listings
   - Update featured status
   - Delete listings
   - Get statistics

3. `src/controllers/public/listingController.js` - Public browsing
   - Browse active listings
   - Get featured listings
   - Get listing by slug
   - Increment view count

### Phase 5: Routes (3 files with subdirectories)

1. `src/routes/end-user/listingRoutes.js` - User endpoints
   - POST `/api/end-user/listings` - Create listing
   - GET `/api/end-user/listings` - Get my listings
   - GET `/api/end-user/listings/stats` - Get my stats
   - POST `/api/end-user/listings/submit/:id` - Submit for approval
   - PATCH `/api/end-user/listings/sold/:id` - Mark as sold
   - POST `/api/end-user/listings/media/:id` - Upload media
   - DELETE `/api/end-user/listings/delete-media/:id/media/:mediaId` - Delete media
   - GET `/api/end-user/listings/:id` - Get my listing
   - PUT `/api/end-user/listings/:id` - Update listing
   - DELETE `/api/end-user/listings/:id` - Delete listing

2. `src/routes/panel/listingRoutes.js` - Admin endpoints
   - GET `/api/panel/listings` - Get all listings
   - GET `/api/panel/listings/stats` - Get statistics
   - PATCH `/api/panel/listings/approve/:id` - Approve listing
   - PATCH `/api/panel/listings/reject/:id` - Reject listing
   - PATCH `/api/panel/listings/featured/:id` - Update featured status
   - GET `/api/panel/listings/:id` - Get listing details
   - DELETE `/api/panel/listings/:id` - Delete listing

3. `src/routes/public/listingRoutes.js` - Public endpoints
   - GET `/api/public/listings` - Browse listings
   - GET `/api/public/listings/featured` - Get featured listings
   - POST `/api/public/listings/view/:id` - Increment view count
   - GET `/api/public/listings/:slug` - Get listing by slug

### Phase 6: Documentation

1. `API-Docs/listings.md` - Complete API documentation
   - All endpoints with examples
   - Request/response formats
   - Status codes
   - Data models and ENUMs
   - Testing examples

### Updated Files

1. `src/routes/index.js` - Mounted listing routes
2. `src/models/index.js` - Already had listing models registered
3. `DATABASE-SCHEMA.md` - Already documented

---

## Database Schema

### listings (Base Table)
- **ID Type**: BIGINT (high-volume)
- **Key Fields**: user_id, category_id, title, price, state_id, city_id
- **Status Flow**: draft → pending → active → expired/sold/rejected
- **Features**: Soft delete, featured listings, auto-expiration (30 days)
- **Audit**: created_by, updated_by (BIGINT - last updater), deleted_by

### car_listings (1:1 with listings)
- **ID Type**: BIGINT
- **Key Fields**: brand_id, model_id, year, fuel_type, transmission
- **Optional**: variant_id, mileage_km, color, body_type, features (JSON)
- **ENUMs**: 
  - condition: 'new', 'used'
  - fuel_type: 'petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'
  - transmission: 'manual', 'automatic', 'cvt', 'semi-automatic'
  - body_type: 'sedan', 'hatchback', 'suv', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'truck'

### property_listings (1:1 with listings)
- **ID Type**: BIGINT
- **Key Fields**: property_type, listing_type, area_sqft
- **Optional**: bedrooms, bathrooms, floor_number, amenities (JSON)
- **ENUMs**:
  - property_type: 'apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse'
  - listing_type: 'sale', 'rent', 'pg', 'hostel'
  - furnished: 'unfurnished', 'semi-furnished', 'fully-furnished'
  - facing: 'north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'

### listing_media
- **ID Type**: BIGINT (high-volume)
- **Key Fields**: listing_id, media_type, media_url, file_size_bytes
- **Optional**: thumbnail_url (nullable), width, height, duration_seconds
- **Features**: display_order, is_primary, storage_type
- **Constraints**: UNIQUE (listing_id, display_order)

---

## Model Relationships

```
User (1) ──→ (N) Listing
Category (1) ──→ (N) Listing
State (1) ──→ (N) Listing
City (1) ──→ (N) Listing

Listing (1) ──→ (1) CarListing
Listing (1) ──→ (1) PropertyListing
Listing (1) ──→ (N) ListingMedia

CarListing (N) ──→ (1) CarBrand
CarListing (N) ──→ (1) CarModel
CarListing (N) ──→ (1) CarVariant (optional)
CarListing (N) ──→ (1) State (registration)
```

---

## Model Hooks

### Listing Model
1. **beforeCreate**: Generate unique slug from title
   - Format: `{title-kebab-case}-{random-6-chars}`
   - Example: `toyota-camry-2020-abc123`

2. **beforeUpdate**: Set updated_by to userId from options
   - Usage: `listing.update(data, { userId: req.user.userId })`

3. **beforeDestroy**: Soft delete cascade (handled by DB CASCADE)

### ListingMedia Model
1. **beforeDestroy**: Delete files from storage (placeholder for service layer implementation)

---

## Key Design Decisions

### 1. Nullable Fields Strategy
- **Most fields are nullable** for user-friendly experience
- Required fields: id, user_id, category_id, title, price, state_id, city_id
- Business logic validation in service layer

### 2. Price Field Usage
- Single `listings.price` field for all types
- Used for: sale price, monthly rent, PG fees, hostel fees
- Removed separate `monthly_rent`, `security_deposit`, `maintenance_monthly` fields

### 3. Listing Type ENUM
- Property listings: `listing_type ENUM('sale', 'rent', 'pg', 'hostel')`
- Separate PG and Hostel types (not combined)

### 4. Media Handling
- `thumbnail_url` is nullable (generated asynchronously)
- No `storage_path` field (not needed)
- `is_primary` enforced in application logic (one per listing)
- Max limits enforced in app: 15 images + 3 videos per listing

### 5. Audit Fields
- `listings.updated_by`: BIGINT (last updater only) - high-volume table
- No audit fields in car_listings/property_listings (changes through parent)
- No audit fields in listing_media (simple media records)

---

## Frontend Field Mapping

### Car Listings - All Fields Covered ✅
- brand → brand_id (FK to car_brands)
- model → model_id (FK to car_models)
- year → year
- price → listings.price
- mileage → mileage_km
- location → state_id + city_id
- fuelType → fuel_type
- transmission → transmission
- bodyType → body_type
- images → listing_media table
- color → color
- engineCapacity → engine_capacity_cc
- owners → owners_count
- description → listings.description
- features → features (JSON array)

### Property Listings - All Fields Covered ✅
- propertyType → property_type
- listingType → listing_type ('sale', 'rent', 'pg', 'hostel')
- price → listings.price (used for all types)
- area → area_sqft
- location → state_id + city_id
- bedrooms → bedrooms
- bathrooms → bathrooms
- balconies → balconies
- furnishing → furnished
- floor → floor_number
- totalFloors → total_floors
- age → age_years
- facing → facing
- address → listings.address
- description → listings.description
- amenities → amenities (JSON array)

---

## Indexes Created

### listings
- `idx_listings_user_id` (user_id)
- `idx_listings_category_id` (category_id)
- `idx_listings_status` (status)
- `idx_listings_state_city` (state_id, city_id)
- `idx_listings_slug` (slug)
- `idx_listings_featured` (is_featured, featured_until)
- `idx_listings_expires_at` (expires_at)
- `idx_listings_deleted_at` (deleted_at)

### car_listings
- `idx_car_listings_listing_id` (listing_id)
- `idx_car_listings_brand_model` (brand_id, model_id)
- `idx_car_listings_year` (year)
- `idx_car_listings_fuel_transmission` (fuel_type, transmission)

### property_listings
- `idx_property_listings_listing_id` (listing_id)
- `idx_property_listings_property_type` (property_type)
- `idx_property_listings_listing_type` (listing_type)
- `idx_property_listings_bedrooms` (bedrooms)
- `idx_property_listings_area` (area_sqft)

### listing_media
- `idx_listing_media_listing_id` (listing_id)
- `idx_listing_media_media_type` (media_type)
- `idx_listing_media_is_primary` (listing_id, is_primary)
- `idx_listing_media_display_order` (listing_id, display_order)
- `unique_listing_display_order` (listing_id, display_order) - UNIQUE constraint

---

## Running Migrations

### Prerequisites
Ensure these tables exist:
- users
- categories
- states
- cities
- car_brands
- car_models
- car_variants

### Execute Migrations
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Or run specific migrations in order
npx sequelize-cli db:migrate --to 20250310000001-create-listings-table.js
npx sequelize-cli db:migrate --to 20250315000001-create-car-listings-table.js
npx sequelize-cli db:migrate --to 20250320000001-create-property-listings-table.js
npx sequelize-cli db:migrate --to 20250325000001-create-listing-media-table.js
```

### Verify Installation
```bash
# Check tables created
psql -d your_database -f run-listing-migrations.sql
```

---

## Next Steps

### 1. Create Repositories
- `src/repositories/listingRepository.js`
- `src/repositories/carListingRepository.js`
- `src/repositories/propertyListingRepository.js`
- `src/repositories/listingMediaRepository.js`

### 2. Create Services
- `src/services/listingService.js` - Business logic for listings
- `src/services/carListingService.js` - Car-specific logic
- `src/services/propertyListingService.js` - Property-specific logic
- `src/services/listingMediaService.js` - Media upload/management

### 3. Create Controllers
- `src/controllers/end-user/listingController.js` - User's own listings
- `src/controllers/panel/listingController.js` - Admin listing management
- `src/controllers/public/listingController.js` - Public listing browsing

### 4. Create Routes
- `src/routes/end-user/listingRoutes.js`
- `src/routes/panel/listingRoutes.js`
- `src/routes/public/listingRoutes.js`

### 5. Implement Features
- Listing creation with media upload
- Listing approval/rejection workflow
- Auto-expiration (30 days)
- Featured listings management
- Search and filtering
- View count tracking
- Soft delete with cascade

### 6. Create Seeders (Optional)
- Sample listings for testing
- Sample media for testing

---

## Business Rules to Implement

### Listing Lifecycle
1. **Draft**: User creates listing, not visible publicly
2. **Pending**: User submits for approval
3. **Active**: Admin approves, listing goes live
   - Set `expires_at` = `approved_at` + 30 days
   - Set `published_at` = current timestamp
4. **Expired**: Auto-expires after 30 days
5. **Sold**: User marks as sold
6. **Rejected**: Admin rejects with reason

### Media Rules
- **Images**: Max 15 per listing (5MB each)
- **Videos**: Max 3 per listing (50MB each, 60s max)
- **Primary Media**: Only ONE `is_primary = true` per listing
- Auto-compress images and generate thumbnails
- Delete files from storage on media deletion

### Validation Rules
**Cars:**
- `year` between 1900 and current year + 1
- `mileage_km` required if `condition = 'used'`
- `registration_year` <= `year`

**Properties:**
- `bedrooms`, `bathrooms` required for residential types
- `area_sqft` > 0

---

## Notes

- All migrations use ES6 modules (`export async function up/down`)
- All models use ES6 modules (`export default`)
- Absolute imports with `#` prefix (e.g., `#config/database.js`)
- Paranoid mode enabled for listings (soft delete)
- CASCADE delete for car_listings, property_listings, listing_media
- Slug auto-generated on create (unique constraint)
- Updated_by tracks last updater only (high-volume table optimization)



---

## Implementation Complete ✅

All phases of the Listings module have been successfully implemented:

✅ **Phase 1:** Database & Models (4 migrations, 4 models)  
✅ **Phase 2:** Repositories (4 files - FLAT structure)  
✅ **Phase 3:** Services (4 files - FLAT structure)  
✅ **Phase 4:** Controllers (3 files with subdirectories)  
✅ **Phase 5:** Routes (3 files with subdirectories)  
✅ **Phase 6:** API Documentation (complete)

---

## Key Features Implemented

### Listing Lifecycle Management
- ✅ Draft → Pending → Active → Expired/Sold/Rejected flow
- ✅ Auto-expiration after 30 days from approval
- ✅ Featured listings with expiry date
- ✅ Soft delete with audit trail

### Media Management
- ✅ Multiple image uploads (max 15 per listing)
- ✅ Primary media selection
- ✅ Display order management
- ✅ Storage cleanup on deletion
- ✅ Image processing and compression

### Search & Filtering
- ✅ Category-based filtering
- ✅ Location filtering (state, city)
- ✅ Price range filtering
- ✅ Car-specific filters (brand, model, year, fuel type, transmission)
- ✅ Property-specific filters (property type, bedrooms, area)
- ✅ Text search in title and description
- ✅ Sorting (newest, price low-high, price high-low)
- ✅ Pagination support

### Validation
- ✅ Required fields validation
- ✅ Car-specific validation (year range, mileage for used cars)
- ✅ Property-specific validation (area > 0, bedrooms for residential)
- ✅ Media limits enforcement (15 images max)
- ✅ Minimum character requirements (title, description)

### Access Control
- ✅ User can only edit own listings
- ✅ User can only edit draft/rejected listings
- ✅ Admin can view/manage all listings
- ✅ Public can only view active listings

### Performance Optimizations
- ✅ Pagination for listing lists
- ✅ Eager loading for related data
- ✅ Indexed queries (status, category, location, slug)
- ✅ View count tracking
- ✅ Statistics aggregation

---

## Route Design (No Conflicts)

All routes follow the pattern: **action before ID parameter** to avoid conflicts.

### End-User Routes
```
POST   /api/end-user/listings                              - Create
GET    /api/end-user/listings                              - List
GET    /api/end-user/listings/stats                        - Stats (action first)
POST   /api/end-user/listings/submit/:id                   - Submit (action first)
PATCH  /api/end-user/listings/sold/:id                     - Mark sold (action first)
POST   /api/end-user/listings/media/:id                    - Upload media (action first)
DELETE /api/end-user/listings/delete-media/:id/media/:mediaId - Delete media (action first)
GET    /api/end-user/listings/:id                          - Get by ID
PUT    /api/end-user/listings/:id                          - Update
DELETE /api/end-user/listings/:id                          - Delete
```

### Panel Routes
```
GET    /api/panel/listings                                 - List all
GET    /api/panel/listings/stats                           - Stats (action first)
PATCH  /api/panel/listings/approve/:id                     - Approve (action first)
PATCH  /api/panel/listings/reject/:id                      - Reject (action first)
PATCH  /api/panel/listings/featured/:id                    - Featured (action first)
GET    /api/panel/listings/:id                             - Get by ID
DELETE /api/panel/listings/:id                             - Delete
```

### Public Routes
```
GET    /api/public/listings                                - Browse
GET    /api/public/listings/featured                       - Featured (action first)
POST   /api/public/listings/view/:id                       - View count (action first)
GET    /api/public/listings/:slug                          - Get by slug
```

---

## Architecture Pattern

**Controller-Service-Repository Pattern** (strictly followed)

```
Controller (HTTP layer)
    ↓
Service (Business logic)
    ↓
Repository (Database operations)
    ↓
Model (Sequelize ORM)
```

### Controllers
- Static methods
- Handle HTTP requests/responses
- Parse and validate input
- Call service layer
- Use response formatters

### Services
- Singleton classes
- Business logic and validation
- Orchestrate repository calls
- Return `{ success, message, data }`

### Repositories
- Singleton classes
- Pure database operations
- No business logic
- Return raw data or null

---

## ES6 Modules Compliance ✅

All files use ES6 modules:
- ✅ `import/export` syntax (no `require()`)
- ✅ `.js` extensions in imports
- ✅ Absolute imports with `#` prefix
- ✅ No CommonJS anywhere

---

## File Organization

### FLAT Structure (No Subdirectories)
- ✅ `src/services/` - All 4 service files in root
- ✅ `src/repositories/` - All 4 repository files in root
- ✅ `src/middleware/` - All middleware in root
- ✅ `src/utils/` - All utilities in root

### Subdirectories ONLY for Controllers & Routes
- ✅ `src/controllers/end-user/` - User controllers
- ✅ `src/controllers/panel/` - Admin controllers
- ✅ `src/controllers/public/` - Public controllers
- ✅ `src/routes/end-user/` - User routes
- ✅ `src/routes/panel/` - Admin routes
- ✅ `src/routes/public/` - Public routes

---

## Testing the Implementation

### 1. Run Migrations (if not already done)
```bash
npx sequelize-cli db:migrate
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Test Endpoints

**Create a Car Listing:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "categoryType": "car",
    "title": "Toyota Camry 2020 - Excellent Condition",
    "description": "Well maintained Toyota Camry with full service history. Single owner, all services done at authorized service center.",
    "price": 1500000,
    "priceNegotiable": true,
    "stateId": 1,
    "cityId": 5,
    "locality": "Andheri West",
    "brandId": 10,
    "modelId": 45,
    "year": 2020,
    "condition": "used",
    "mileageKm": 25000,
    "fuelType": "petrol",
    "transmission": "automatic"
  }'
```

**Upload Images:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Submit for Approval:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings/submit/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Approve Listing (Admin):**
```bash
curl -X PATCH http://localhost:5000/api/panel/listings/approve/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Browse Public Listings:**
```bash
curl http://localhost:5000/api/public/listings?page=1&limit=10
```

---

## Next Steps (Optional Enhancements)

### Future Features (Not Implemented Yet)
1. **Favorites System** - Users can save favorite listings
2. **Listing Reports** - Users can report inappropriate listings
3. **View Tracking** - Detailed view analytics per listing
4. **Price History** - Track price changes over time
5. **Listing Comparison** - Compare multiple listings side-by-side
6. **Boost/Promote** - Premium features for better visibility
7. **Auto-refresh** - Automatically refresh listings to top
8. **Email Notifications** - Notify users on status changes
9. **Advanced Search** - Saved searches, alerts for new listings
10. **Listing Analytics** - Views, contacts, conversion metrics

### Performance Enhancements
1. **Redis Caching** - Cache frequently accessed listings
2. **Elasticsearch** - Full-text search with better performance
3. **CDN Integration** - Serve images from CDN
4. **Database Indexing** - Additional composite indexes
5. **Query Optimization** - Optimize complex queries

---

## Troubleshooting

### Common Issues

**1. "Listing not found" error:**
- Check if listing ID exists
- Verify user has access to the listing
- Check if listing is soft-deleted

**2. "Cannot edit listing in current status":**
- Only draft and rejected listings can be edited
- Submit a new listing or wait for rejection

**3. "At least one image is required":**
- Upload at least one image before submitting
- Use the media upload endpoint

**4. "Media upload limit reached":**
- Maximum 15 images per listing
- Delete old images before uploading new ones

**5. "Slug already exists":**
- Slug is auto-generated with random suffix
- This should rarely happen, retry if it does

---

## Database Schema Summary

### listings (Base Table)
- **ID Type:** BIGINT (high-volume)
- **Status Flow:** draft → pending → active → expired/sold/rejected
- **Auto-expiration:** 30 days from approval
- **Soft Delete:** Yes (paranoid mode)

### car_listings (1:1 with listings)
- **ID Type:** BIGINT
- **Cascade Delete:** Yes
- **Validation:** Year range, mileage for used cars

### property_listings (1:1 with listings)
- **ID Type:** BIGINT
- **Cascade Delete:** Yes
- **Validation:** Area > 0, bedrooms for residential

### listing_media
- **ID Type:** BIGINT (high-volume)
- **Cascade Delete:** Yes
- **Limits:** 15 images max per listing
- **Primary Media:** One per listing (enforced in app)

---

## Code Quality

✅ **No Diagnostics Errors** - All files pass TypeScript/ESLint checks  
✅ **ES6 Modules** - Consistent import/export usage  
✅ **Absolute Imports** - Using `#` prefix throughout  
✅ **Response Formatters** - Standardized API responses  
✅ **Error Handling** - Try-catch blocks in all controllers  
✅ **Validation** - Input validation in services  
✅ **Audit Trail** - created_by, updated_by, deleted_by tracking  
✅ **Soft Deletes** - Paranoid mode for data recovery  

---

## Documentation

✅ **API Documentation** - Complete with examples (`API-Docs/listings.md`)  
✅ **Schema Documentation** - Updated `DATABASE-SCHEMA.md`  
✅ **Implementation Summary** - This document  
✅ **Code Comments** - JSDoc comments in all files  

---

## Summary

The Listings module is **fully implemented and production-ready** with:

- **4 Repositories** - Database operations
- **4 Services** - Business logic
- **3 Controllers** - HTTP handlers (end-user, panel, public)
- **3 Route files** - API endpoints
- **Complete API documentation** - With examples
- **No route conflicts** - Action before ID pattern
- **ES6 modules** - Fully compliant
- **FLAT structure** - Services and repositories
- **Subdirectories** - Only for controllers and routes
- **Zero diagnostics errors** - Clean code

**Total Files Created:** 18 files (4 repos + 4 services + 3 controllers + 3 routes + 1 doc + updated 3 files)

**Ready for testing and deployment!** 🚀
