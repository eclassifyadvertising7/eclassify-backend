# Listings Feed API Documentation

Three separate endpoints for different listing browsing experiences.

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/public/listings/homepage` | ❌ | Guest homepage feed (simple, newest first) |
| GET | `/api/end-user/listings/feed` | ✅ | Personalized feed for authenticated users |
| GET | `/api/public/listings/category/:categorySlugOrId` | ❌ | Category-specific listings with advanced filters |

---

## 1. Homepage Feed (Guest Users)

**Endpoint:** `GET /api/public/listings/homepage`

**Authentication:** Not required

**Description:** Simple feed for homepage - shows newest active listings without filters. Ideal for landing page.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max 100) |

### Response

```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "2020 Honda Civic",
      "slug": "2020-honda-civic-abc123",
      "description": "Well maintained car...",
      "price": 850000,
      "priceNegotiable": true,
      "status": "active",
      "isFeatured": false,
      "viewCount": 45,
      "expiresAt": "2025-02-15T10:30:00.000Z",
      "categoryId": 1,
      "categoryName": "Cars",
      "categorySlug": "cars",
      "stateId": 1,
      "stateName": "Maharashtra",
      "cityId": 1,
      "cityName": "Mumbai",
      "locality": "Andheri West",
      "userId": 456,
      "userName": "John Doe",
      "userMobile": "9175113022",
      "media": [
        {
          "id": 1,
          "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/photo1.jpg",
          "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/thumb_photo1.jpg",
          "mediaType": "image",
          "displayOrder": 1
        }
      ],
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 2. Personalized Feed (Authenticated Users)

**Endpoint:** `GET /api/end-user/listings/feed`

**Authentication:** Required (JWT token)

**Description:** Personalized feed for logged-in users. Currently returns active listings with optional filters. Future: will include recommendations based on user preferences, browsing history, and location.

### Headers

```
Authorization: Bearer <jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max 100) |
| categoryId | integer | No | - | Filter by category |
| stateId | integer | No | - | Filter by state |
| cityId | integer | No | - | Filter by city |
| minPrice | number | No | - | Minimum price |
| maxPrice | number | No | - | Maximum price |
| search | string | No | - | Search in title/description |
| sortBy | string | No | date_desc | Sort order (see options below) |

**Sort Options:**
- `date_desc` - Newest first (default)
- `date_asc` - Oldest first
- `price_asc` - Price low to high
- `price_desc` - Price high to low
- `views_desc` - Most viewed

### Response

Same structure as homepage feed.

---

## 3. Category Browse with Advanced Filters

**Endpoint:** `GET /api/public/listings/category/:categorySlugOrId`

**Authentication:** Not required

**Description:** Browse listings within a specific category with advanced filtering options. Supports both category slug (e.g., "cars") and ID (e.g., "1").

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categorySlugOrId | string/integer | Yes | Category slug (e.g., "cars") or ID (e.g., "1") |

### Query Parameters

#### Basic Filters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max 100) |
| stateId | integer | No | - | Filter by state |
| cityId | integer | No | - | Filter by city |
| isFeatured | boolean | No | - | Show only featured listings |
| minPrice | number | No | - | Minimum price |
| maxPrice | number | No | - | Maximum price |
| search | string | No | - | Search in title/description |
| sortBy | string | No | date_desc | Sort order |

#### Car-Specific Filters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| brandId | integer | No | Car brand ID |
| modelId | integer | No | Car model ID |
| variantId | integer | No | Car variant ID |
| minYear | integer | No | Minimum year |
| maxYear | integer | No | Maximum year |
| condition | string | No | `new`, `used` |
| fuelType | string | No | `petrol`, `diesel`, `electric`, `hybrid`, `cng` |
| transmission | string | No | `manual`, `automatic` |
| bodyType | string | No | `sedan`, `suv`, `hatchback`, `coupe`, `convertible`, `wagon`, `van`, `truck` |
| minMileage | integer | No | Minimum mileage (km) |
| maxMileage | integer | No | Maximum mileage (km) |
| ownersCount | integer | No | Number of previous owners |

#### Property-Specific Filters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| propertyType | string | No | `residential`, `commercial`, `industrial`, `agricultural`, `plot` |
| listingType | string | No | `sale`, `rent`, `lease`, `pg` |
| bedrooms | integer | No | Number of bedrooms |
| bathrooms | integer | No | Number of bathrooms |
| minArea | integer | No | Minimum area (sq ft) |
| maxArea | integer | No | Maximum area (sq ft) |
| furnished | string | No | `furnished`, `semi-furnished`, `unfurnished` |
| facing | string | No | `north`, `south`, `east`, `west`, `north-east`, `north-west`, `south-east`, `south-west` |
| parkingSpaces | integer | No | Number of parking spaces |

### Response

Same structure as homepage feed, but includes category-specific data:

```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "2020 Honda Civic",
      "carListing": {
        "brandId": 5,
        "brandName": "Honda",
        "modelId": 25,
        "modelName": "Civic",
        "variantId": 150,
        "variantName": "VTi-LX",
        "year": 2020,
        "condition": "used",
        "fuelType": "petrol",
        "transmission": "automatic",
        "mileage": 35000,
        "ownersCount": 1
      }
    }
  ],
  "pagination": {}
}
```

---

## Error Responses

### Category Not Found

```json
{
  "success": false,
  "message": "Category not found"
}
```

**Status Code:** 404

### Category Not Active

```json
{
  "success": false,
  "message": "Category is not active"
}
```

**Status Code:** 400

### Unauthorized (for personalized feed)

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Status Code:** 401

---

## Notes

1. **Homepage Feed** - Simplest endpoint, no filters, newest first. Use for landing page.

2. **Personalized Feed** - Requires authentication. Currently supports basic filters. Future enhancements will include:
   - User preference-based recommendations
   - Location-based suggestions
   - Browsing history analysis
   - Favorite category prioritization

3. **Category Browse** - Most powerful endpoint with category-specific filters. Use for dedicated category pages.

4. **Performance** - All endpoints are paginated. Default limit is 20, maximum is 100.

5. **Media URLs** - All media URLs are full URLs (not relative paths) ready to use in `<img>` tags.

6. **Sorting** - Available sort options: `date_desc`, `date_asc`, `price_asc`, `price_desc`, `views_desc`

7. **Category Identification** - Category browse endpoint accepts both slug (e.g., "cars") and ID (e.g., "1") for flexibility.
