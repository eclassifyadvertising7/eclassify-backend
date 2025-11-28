# Data Requests Implementation Summary

Unified system for users to request missing car data (brands/models/variants) and location data (states/cities).

## What Was Built

### Single Unified Table: `data_requests`

One table handles both car and location data requests with these fields:

**Common Fields:**
- `request_type`: 'brand', 'model', 'variant', 'state', 'city'
- `status`: 'pending', 'approved', 'rejected'
- `additional_details`, `reviewed_by`, `reviewed_at`, `rejection_reason`

**Car Data Fields (nullable):**
- `brand_name`, `model_name`, `variant_name`
- `created_brand_id`, `created_model_id`, `created_variant_id`

**Location Data Fields (nullable):**
- `state_name`, `city_name`
- `created_state_id`, `created_city_id`

## Files Created/Updated

### Migration
- `migrations/20250330000001-create-data-requests-table.js`
- `run-data-requests-migration.sql` (manual SQL)

### Model
- `src/models/DataRequest.js`

### Repository
- `src/repositories/dataRequestRepository.js`

### Service
- `src/services/dataRequestService.js`
  - Handles validation for both car and location requests
  - Creates entities on approval (brands/models/variants/states/cities)
  - Auto-creates parent entities if missing

### Controllers
- `src/controllers/end-user/dataRequestController.js`
- `src/controllers/panel/dataRequestController.js`

### Routes
- `src/routes/end-user/dataRequestRoutes.js`
- `src/routes/panel/dataRequestRoutes.js`

### Updated Files
- `src/routes/index.js` - Mounted routes
- `src/models/index.js` - Added DataRequest model
- `DATABASE-SCHEMA.md` - Added table documentation

## API Endpoints

### End User
- `POST /api/end-user/data-requests` - Submit request
- `GET /api/end-user/data-requests` - Get my requests
- `GET /api/end-user/data-requests/:id` - Get specific request

### Admin Panel (super_admin only)
- `GET /api/panel/data-requests` - Get all requests with filters
- `GET /api/panel/data-requests/statistics` - Get statistics
- `GET /api/panel/data-requests/:id` - Get specific request
- `PATCH /api/panel/data-requests/approve/:id` - Approve request
- `PATCH /api/panel/data-requests/reject/:id` - Reject request

## Request Examples

### Car Brand Request
```json
{
  "requestType": "brand",
  "brandName": "Tesla",
  "additionalDetails": "Electric vehicle manufacturer"
}
```

### Car Model Request
```json
{
  "requestType": "model",
  "brandName": "Tesla",
  "modelName": "Model 3"
}
```

### Car Variant Request
```json
{
  "requestType": "variant",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Long Range AWD"
}
```

### State Request
```json
{
  "requestType": "state",
  "stateName": "Goa"
}
```

### City Request
```json
{
  "requestType": "city",
  "stateName": "Goa",
  "cityName": "Panaji"
}
```

## Approval Examples

### Approve Brand
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA"
  }
}
```

### Approve State
```json
{
  "createData": {
    "name": "Goa",
    "regionSlug": "west",
    "regionName": "West India"
  }
}
```

### Approve City
```json
{
  "createData": {
    "name": "Panaji",
    "latitude": 15.4909,
    "longitude": 73.8278
  }
}
```

### Reject Request
```json
{
  "rejectionReason": "This brand already exists in our database as 'Tesla Motors'. Please search again."
}
```

## Key Features

✅ **Unified workflow** - Same process for all data requests
✅ **Duplicate prevention** - Checks for similar pending requests
✅ **Auto-creation** - Creates parent entities if missing (e.g., brand when approving model)
✅ **Transaction safety** - All-or-nothing operations
✅ **Explicit payloads** - Approve/reject require explicit data
✅ **Status tracking** - Users see approved/rejected status
✅ **Statistics** - Admin dashboard shows request metrics
✅ **Flexible validation** - Different rules per request type

## Benefits of Unified Table

1. **Single admin workflow** - One place to review all requests
2. **Consistent UX** - Users use same pattern for all missing data
3. **Less code duplication** - Reuse controllers/services/routes
4. **Better statistics** - See all data requests in one dashboard
5. **Simpler maintenance** - One table, one set of endpoints

## Next Steps

1. Run the migration: `npx sequelize-cli db:migrate`
2. Or run SQL manually: `run-data-requests-migration.sql`
3. Test endpoints with Postman/Thunder Client
4. Update API documentation if needed
