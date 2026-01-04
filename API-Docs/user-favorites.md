# User Favorites API Documentation

## Overview
API endpoints for managing user favorites functionality, allowing users to save and manage their favorite listings.

## Authentication
End-user endpoints require authentication. Public endpoints are accessible without authentication. Panel endpoints require admin/staff roles.

---

## End-User Endpoints

### Add Listing to Favorites
**POST** `/api/end-user/create/favorites`

Add a listing to user's favorites.

**Request Body:**
```json
{
  "listingId": 12345
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing added to favorites",
  "data": {
    "favoriteId": 67890,
    "restored": false
  }
}
```

**Error Responses:**
- `400` - Listing already in favorites
- `404` - Listing not found
- `401` - Authentication required

---

### Remove Listing from Favorites
**DELETE** `/api/end-user/delete/favorites/:listingId`

Remove a listing from user's favorites.

**Response:**
```json
{
  "success": true,
  "message": "Listing removed from favorites"
}
```

**Error Responses:**
- `404` - Listing not found in favorites
- `401` - Authentication required

---

### Get User's Favorites
**GET** `/api/end-user/get/favorites`

Get user's favorite listings with complete listing details including user, category, location, car/property details, and media.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 50)
- `categoryId` (number, optional) - Filter by category
- `priceMin` (number, optional) - Minimum price filter
- `priceMax` (number, optional) - Maximum price filter
- `sortBy` (string, optional) - Sort field: `created_at`, `price` (default: `created_at`)
- `sortOrder` (string, optional) - Sort order: `ASC`, `DESC` (default: `DESC`)

**Response:**
```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "favorites": [
      {
        "id": "1",
        "userId": "3",
        "listingId": "3",
        "createdAt": "2026-01-03T07:13:53.229Z",
        "deletedAt": null,
        "listing": {
          "id": "3",
          "userId": "6",
          "categoryId": 1,
          "categoryType": "car",
          "title": "I want to sell 2018 BMW 3-Series 320D Luxury Line PETROL MANUAL",
          "slug": "i-want-to-sell-2018-bmw-3-series-320d-luxury-line-petrol-manual",
          "shareCode": null,
          "description": "Selling my well-maintained 2018 BMW 3-Series...",
          "price": "300000.00",
          "priceNegotiable": true,
          "stateId": 14,
          "cityId": 5692,
          "stateName": "Maharashtra",
          "cityName": "Pune City",
          "locality": "Pune Camp, Ghorpuri Bazar",
          "pincode": "411001",
          "address": null,
          "latitude": "18.47558333",
          "longitude": "73.79619444",
          "status": "active",
          "isFeatured": true,
          "featuredUntil": "2026-02-01T06:35:09.060Z",
          "expiresAt": "2026-03-03T06:35:09.060Z",
          "publishedAt": "2026-01-02T06:35:09.060Z",
          "approvedAt": "2026-01-02T06:35:09.060Z",
          "approvedBy": "6",
          "rejectedAt": null,
          "rejectedBy": null,
          "rejectionReason": null,
          "viewCount": 0,
          "contactCount": 0,
          "totalFavorites": 0,
          "isAutoApproved": false,
          "postedByType": "owner",
          "userSubscriptionId": null,
          "isPaidListing": false,
          "keywords": "BMW, 3-Series, 320D Luxury Line...",
          "republishCount": 0,
          "lastRepublishedAt": null,
          "republishHistory": null,
          "created_at": "2026-01-02T06:35:09.060Z",
          "updated_at": "2026-01-02T06:35:09.060Z",
          "user": {
            "id": "6",
            "fullName": "Parth",
            "email": "parth.eclassify@yopmail.com",
            "mobile": "8002555666",
            "profile": {
              "profilePhoto": "http://localhost:5000/uploads/profiles/photo.jpg"
            }
          },
          "category": {
            "id": 1,
            "name": "Cars",
            "slug": "cars"
          },
          "state": {
            "id": 14,
            "name": "Maharashtra",
            "slug": "maharashtra"
          },
          "city": {
            "id": 5692,
            "name": "Pune City",
            "slug": "pune-city-maharashtra-411001"
          },
          "carListing": {
            "id": "1",
            "listingId": "1",
            "brandId": 7,
            "brandName": "BMW",
            "modelId": 148,
            "modelName": "3-Series",
            "variantId": 772,
            "variantName": "320D Luxury Line",
            "year": 2018,
            "registrationYear": null,
            "condition": "used",
            "mileageKm": 10000,
            "ownersCount": 1,
            "fuelType": "petrol",
            "transmission": "manual",
            "bodyType": null,
            "color": "White",
            "engineCapacityCc": null,
            "powerBhp": null,
            "seats": 5,
            "registrationNumber": null,
            "registrationStateId": null,
            "vinNumber": null,
            "insuranceValidUntil": null,
            "features": ["Fog Lights", "Air Conditioning", "Parking Sensors"],
            "brand": {
              "id": 7,
              "name": "BMW",
              "slug": "bmw"
            },
            "model": {
              "id": 148,
              "name": "3-Series",
              "slug": "bmw-3-series"
            },
            "variant": {
              "id": 772,
              "variantName": "320D Luxury Line",
              "slug": "bmw-3-series-320d-luxury-line"
            }
          },
          "propertyListing": null,
          "media": [
            {
              "mediaUrl": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-3/images/20251231151230-audi-a4-7hl.jpg",
              "thumbnailUrl": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-3/images/20251231151230-audi-a4-7hl.jpg",
              "id": "1",
              "listingId": "1",
              "mediaType": "image",
              "mimeType": "image/jpeg",
              "thumbnailMimeType": "image/jpeg",
              "fileSizeBytes": 102400,
              "width": 1200,
              "height": 800,
              "displayOrder": 0,
              "isPrimary": true,
              "storageType": "cloudinary"
            }
          ],
          "totalFavorites": 1,
          "isFavorited": true
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

**Note:** The response now includes complete listing details identical to the single listing endpoint, including:
- User information with profile photo
- Category, state, and city details
- Car listing details (brand, model, variant) for car category
- Property listing details for property category
- All media files with full URLs
- Favorite count and isFavorited status

---

### Check if Listing is Favorited
**GET** `/api/end-user/favorites/check/:listingId`

Check if a specific listing is in user's favorites.

**Response:**
```json
{
  "success": true,
  "data": {
    "isFavorited": true
  }
}
```

---

### Get Favorite Listing IDs
**GET** `/api/end-user/favorites/ids`

Get only the listing IDs of all favorited listings for the authenticated user. Useful for quickly checking favorite status of multiple listings without fetching full listing details.

**Response:**
```json
{
  "success": true,
  "data": {
    "listingIds": [1, 5, 12, 45, 67, 89]
  }
}
```

**Error Responses:**
- `401` - Authentication required
- `500` - Internal server error

**Use Case:** This endpoint is optimized for frontend applications.

---

### Get User's Favorite Statistics
**GET** `/api/end-user/favorites/stats`

Get user's favorite statistics and breakdown by category.

**Response:**
```json
{
  "success": true,
  "message": "Favorite statistics retrieved successfully",
  "data": {
    "totalFavorites": 25,
    "favoritesByCategory": [
      {
        "categoryId": 1,
        "count": 15,
        "listing": {
          "category": {
            "name": "Cars"
          }
        }
      },
      {
        "categoryId": 2,
        "count": 10,
        "listing": {
          "category": {
            "name": "Properties"
          }
        }
      }
    ]
  }
}
```

---

## Public Endpoints

### Get Listing Favorite Count
**GET** `/api/public/listings/:listingId/favorite-count`

Get the total number of favorites for a specific listing. No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "Listing favorite count retrieved successfully",
  "data": {
    "listingId": 12345,
    "favoriteCount": 42
  }
}
```

**Error Responses:**
- `400` - Invalid listing ID
- `500` - Internal server error

**Note:** Favorite counts are also automatically included in all listing responses (get listings, get listing details, search results) as `totalFavorites` field.



---

## Panel Endpoints (Admin/Staff)

### Get Most Favorited Listings
**GET** `/api/panel/favorites/analytics/most-favorited`

Get listings with highest favorite counts for analytics.

**Query Parameters:**
- `limit` (number, optional) - Number of results (default: 10, max: 50)
- `categoryId` (number, optional) - Filter by category
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Most favorited listings retrieved successfully",
  "data": {
    "listings": [
      {
        "listingId": 12345,
        "favoriteCount": 45,
        "listing": {
          "id": 12345,
          "title": "Honda City 2020",
          "price": 850000,
          "status": "active"
        }
      }
    ]
  }
}
```

---

### Get Favorite Analytics
**GET** `/api/panel/favorites/analytics/stats`

Get overall favorite statistics for admin dashboard.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Favorite analytics retrieved successfully",
  "data": {
    "totalFavorites": 1250,
    "uniqueUsers": 340,
    "uniqueListings": 890,
    "avgFavoritesPerUser": "3.68"
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
  "message": "Listing already in favorites"
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
  "message": "Listing not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Favorites support soft delete (can be restored if re-favorited)
- Maximum 50 items per page for performance
- Panel endpoints require appropriate role permissions
- Favorite counts are cached for performance in analytics