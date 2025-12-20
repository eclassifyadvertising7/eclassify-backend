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

Get user's favorite listings with pagination and filters.

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
        "id": 67890,
        "userId": 123,
        "listingId": 12345,
        "createdAt": "2025-01-15T10:30:00Z",
        "listing": {
          "id": 12345,
          "title": "Honda City 2020",
          "price": 850000,
          "status": "active",
          "categoryId": 1,
          "createdAt": "2025-01-10T08:00:00Z",
          "category": {
            "id": 1,
            "name": "Cars"
          },
          "media": [
            {
              "id": 1,
              "mediaUrl": "http://localhost:5000/uploads/listings/photo1.jpg",
              "mediaType": "image"
            }
          ]
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    }
  }
}
```

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

**Note:** Favorite counts are also automatically included in all listing responses (get listings, get listing details, search results) as `favoriteCount` field.



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