# Listings Search API Documentation

## Overview
Advanced search functionality for classified listings with location-based ranking, intelligent filtering, and comprehensive analytics integration.

## Authentication
Public search endpoints require no authentication. End-user and panel endpoints require appropriate authentication and permissions.

## Important Notes

- **Favorite Counts**: All search results automatically include a `favoriteCount` field for each listing.
- **Location Ranking**: Results are ranked based on user location proximity when location data is available.

---

## Location Priority System

The search system uses a 6-level location priority hierarchy:

1. **User Preferred Location** (manually set) - Highest priority
2. **Browser Geolocation** (GPS coordinates) - Second priority  
3. **User Profile Location** (from account) - Third priority
4. **IP-based Location** (from request headers) - Fourth priority
5. **Query Parameters** (backward compatibility) - Fifth priority
6. **No Location Filter** (generalized listings) - Last fallback

---

## Public Search Endpoints

### Main Search
**GET** `/api/public/listings/search`

Advanced search with location-based ranking and intelligent filtering.

**Query Parameters:**

**Text Search:**
- `query` (string, optional) - Search query for title, description, keywords
- `sortBy` (string, optional) - Sort order: `relevance`, `price_low`, `price_high`, `date_new`, `date_old` (default: `relevance`)

**Location Parameters (Priority 1 - User Preferred):**
- `preferredStateId` (number, optional) - Manually selected state ID
- `preferredCityId` (number, optional) - Manually selected city ID  
- `preferredLatitude` (number, optional) - Manually selected latitude
- `preferredLongitude` (number, optional) - Manually selected longitude

**Location Parameters (Priority 2 - Browser Geolocation):**
- `browserLatitude` (number, optional) - GPS latitude from navigator.geolocation
- `browserLongitude` (number, optional) - GPS longitude from navigator.geolocation

**Basic Filters:**
- `categoryId` (number, optional) - Category filter
- `priceMin` (number, optional) - Minimum price
- `priceMax` (number, optional) - Maximum price
- `stateId` (number, optional) - State filter (fallback location)
- `cityId` (number, optional) - City filter (fallback location)
- `locality` (string, optional) - Locality/area name
- `postedByType` (string, optional) - Seller type: `owner`, `agent`, `dealer`
- `featuredOnly` (boolean, optional) - Show only featured listings

**Car-Specific Filters:**
- `brandId` (number, optional) - Car brand ID
- `modelId` (number, optional) - Car model ID
- `variantId` (number, optional) - Car variant ID
- `year` (number, optional) - Manufacturing year
- `fuelType` (string, optional) - Fuel type: `petrol`, `diesel`, `cng`, `electric`, `hybrid`
- `transmission` (string, optional) - Transmission: `manual`, `automatic`, `cvt`
- `condition` (string, optional) - Condition: `excellent`, `good`, `fair`
- `minMileage` (number, optional) - Minimum mileage (km)
- `maxMileage` (number, optional) - Maximum mileage (km)

**Property-Specific Filters:**
- `propertyType` (string, optional) - Property type: `apartment`, `house`, `villa`, `plot`
- `bedrooms` (number, optional) - Number of bedrooms
- `bathrooms` (number, optional) - Number of bathrooms
- `minArea` (number, optional) - Minimum area (sq ft)
- `maxArea` (number, optional) - Maximum area (sq ft)

**Pagination:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 50)

**Example Request:**
```
GET /api/public/listings/search?query=honda%20city&preferredStateId=12&preferredCityId=345&categoryId=1&priceMin=500000&priceMax=1000000&fuelType=petrol&transmission=automatic&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "listings": [
      {
        "id": 12345,
        "title": "Honda City 2020 Petrol Automatic",
        "slug": "honda-city-2020-petrol-automatic-abc123",
        "price": 850000,
        "priceNegotiable": true,
        "status": "active",
        "isFeatured": true,
        "isPaidListing": true,
        "locality": "Koramangala",
        "postedByType": "owner",
        "searchScore": 95.5,
        "locationMatch": "same_city",
        "locationScore": 50,
        "paidScore": 30,
        "featuredScore": 20,
        "freshnessScore": 8,
        "createdAt": "2025-01-10T08:00:00Z",
        "user": {
          "id": 123,
          "fullName": "John Doe",
          "mobile": "9175113022"
        },
        "category": {
          "id": 1,
          "name": "Cars",
          "slug": "cars"
        },
        "state": {
          "id": 12,
          "name": "Karnataka",
          "slug": "karnataka"
        },
        "city": {
          "id": 345,
          "name": "Bangalore",
          "slug": "bangalore"
        },
        "media": [
          {
            "id": 1,
            "mediaUrl": "http://localhost:5000/uploads/listings/photo1.jpg",
            "thumbnailUrl": "http://localhost:5000/uploads/listings/thumb_photo1.jpg",
            "mediaType": "image"
          }
        ],
        "carListing": {
          "brandId": 1,
          "modelId": 5,
          "year": 2020,
          "fuelType": "petrol",
          "transmission": "automatic",
          "condition": "excellent",
          "mileageKm": 25000,
          "brand": {
            "id": 1,
            "name": "Honda",
            "slug": "honda"
          },
          "model": {
            "id": 5,
            "name": "City",
            "slug": "city"
          }
        }
      }
    ],
    "pagination": {
      "total": 487,
      "page": 1,
      "limit": 20,
      "totalPages": 25
    },
    "searchMeta": {
      "query": "honda city",
      "totalResults": 487,
      "searchTime": 1704447600000,
      "hasLocationFilter": true,
      "userLocation": {
        "stateId": 12,
        "cityId": 345,
        "source": "user_preferred",
        "priority": 1
      },
      "appliedFilters": {
        "query": "honda city",
        "categoryId": 1,
        "priceRange": {
          "min": 500000,
          "max": 1000000
        },
        "location": {
          "stateId": 12,
          "cityId": 345,
          "source": "user_preferred"
        },
        "fuelType": "petrol",
        "transmission": "automatic"
      }
    }
  }
}
```

---

### Search Suggestions
**GET** `/api/public/listings/search/suggestions`

Get autocomplete suggestions based on search query.

**Query Parameters:**
- `query` (string, required) - Partial search query (minimum 2 characters)
- `limit` (number, optional) - Number of suggestions (default: 5, max: 10)

**Response:**
```json
{
  "success": true,
  "message": "Search suggestions retrieved successfully",
  "data": {
    "suggestions": [
      "honda city",
      "honda city 2020",
      "honda city automatic",
      "honda city petrol",
      "honda city bangalore"
    ],
    "query": "honda"
  }
}
```

---

### Search Filters
**GET** `/api/public/listings/search/filters/:categoryId?`

Get available search filters for a category.

**Path Parameters:**
- `categoryId` (number, optional) - Category ID for category-specific filters

**Response:**
```json
{
  "success": true,
  "message": "Search filters retrieved successfully",
  "data": {
    "priceRanges": [
      {
        "label": "Under ₹1 Lakh",
        "min": 0,
        "max": 100000
      },
      {
        "label": "₹1-5 Lakh",
        "min": 100000,
        "max": 500000
      },
      {
        "label": "₹5-10 Lakh",
        "min": 500000,
        "max": 1000000
      }
    ],
    "postedByTypes": [
      {
        "value": "owner",
        "label": "Owner"
      },
      {
        "value": "agent",
        "label": "Agent"
      },
      {
        "value": "dealer",
        "label": "Dealer"
      }
    ],
    "carFilters": {
      "brands": [
        {
          "id": 1,
          "name": "Honda",
          "slug": "honda"
        },
        {
          "id": 2,
          "name": "Maruti",
          "slug": "maruti"
        }
      ],
      "fuelTypes": [
        {
          "value": "petrol",
          "label": "Petrol"
        },
        {
          "value": "diesel",
          "label": "Diesel"
        }
      ],
      "transmissions": [
        {
          "value": "manual",
          "label": "Manual"
        },
        {
          "value": "automatic",
          "label": "Automatic"
        }
      ]
    }
  }
}
```

---

### Featured Listings
**GET** `/api/public/listings/featured`

Get featured listings with location-based ranking.

**Query Parameters:**
- `categoryId` (number, optional) - Category filter
- `stateId` (number, optional) - State filter
- `cityId` (number, optional) - City filter
- `limit` (number, optional) - Number of results (default: 10, max: 20)

**Response:**
```json
{
  "success": true,
  "message": "Featured listings retrieved successfully",
  "data": {
    "listings": [
      {
        "id": 12345,
        "title": "Honda City 2020 Petrol Automatic",
        "price": 850000,
        "isFeatured": true,
        "featuredUntil": "2025-01-25T00:00:00Z",
        "locationMatch": "same_city",
        "searchScore": 95.5
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### Similar Listings
**GET** `/api/public/listings/:id/similar`

Get similar listings based on current listing.

**Path Parameters:**
- `id` (number, required) - Current listing ID

**Query Parameters:**
- `limit` (number, optional) - Number of similar listings (default: 5, max: 10)

**Response:**
```json
{
  "success": true,
  "message": "Similar listings retrieved successfully",
  "data": {
    "listings": [
      {
        "id": 12346,
        "title": "Honda City 2019 Petrol Manual",
        "price": 750000,
        "locationMatch": "same_city",
        "searchScore": 88.2
      }
    ],
    "baseListing": {
      "id": 12345,
      "title": "Honda City 2020 Petrol Automatic",
      "price": 850000,
      "categoryId": 1
    }
  }
}
```

---

## End-User Search Endpoints

### Personalized Search
**GET** `/api/end-user/listings/search`

Personalized search with user history and preferences (requires authentication).

**Query Parameters:** Same as public search, plus:
- Automatically uses user's profile location as fallback
- Search activity is logged for recommendations
- Results may be personalized based on user history

**Authentication:** Required (Bearer token)

**Response:** Same structure as public search with additional personalization data.

---

### User Search Suggestions
**GET** `/api/end-user/listings/search/suggestions`

Get personalized search suggestions based on user history.

**Query Parameters:**
- `query` (string, required) - Partial search query
- `limit` (number, optional) - Number of suggestions (default: 5, max: 10)

**Authentication:** Required

**Response:** Same as public suggestions with user-specific recommendations.

---

## Panel Search Endpoints (Admin/Staff)

### Admin Search
**GET** `/api/panel/listings/search`

Advanced search for admin panel with access to all listing statuses.

**Query Parameters:** Same as public search, plus:
- `status` (string, optional) - Listing status: `draft`, `pending`, `active`, `expired`, `sold`, `rejected`
- `userId` (number, optional) - Filter by specific user
- Higher pagination limit (max: 100)

**Authentication:** Required (admin/staff roles)

**Response:** Same structure with additional admin fields.

---

### Search Analytics
**GET** `/api/panel/listings/search/analytics`

Get search analytics for admin dashboard.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `categoryId` (number, optional) - Category filter

**Authentication:** Required (admin/staff roles)

**Response:**
```json
{
  "success": true,
  "message": "Search analytics retrieved successfully",
  "data": {
    "total": 1250,
    "draft": 45,
    "pending": 23,
    "active": 987,
    "expired": 156,
    "sold": 34,
    "rejected": 5,
    "searchPeriod": {
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-01-15T23:59:59Z"
    },
    "categoryFilter": 1
  }
}
```



---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid pagination parameters"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to search listings"
}
```

---

## Search Scoring System

### Location Scoring (0-50 points)
- **Same City**: 50 points × location source multiplier
- **Same State**: 25 points × location source multiplier  
- **Different State**: 0 points

### Location Source Multipliers
- **User Preferred**: 1.0 (100% score)
- **Browser GPS**: 0.9 (90% score)
- **User Profile**: 0.8 (80% score)
- **IP Geolocation**: 0.6 (60% score)
- **Query Params**: 0.5 (50% score)

### Additional Scoring
- **Paid Listing Bonus**: +30 points
- **Featured Bonus**: +20 points
- **Freshness Bonus**: +10 points (last 24h), +7 (last week), +5 (last month)

### Text Relevance
- PostgreSQL full-text search ranking using `ts_rank()`
- Searches across title, description, and keywords fields
- Weighted by search term frequency and position

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Location detection follows 6-level priority hierarchy
- Search activity is automatically logged for analytics
- IP-based location detection supports CDN geolocation headers
- Maximum 50 items per page for public endpoints, 100 for admin
- Search results are cached for performance (when implemented)
- Similar listings use price range ±30% and same category/location