# User Searches API Documentation

## Overview
API endpoints for logging and analyzing user search behavior, providing insights into search patterns and popular queries.

## Authentication
End-user endpoints support both authenticated and anonymous users. Panel endpoints require admin/staff roles.

---

## End-User Endpoints

### Log Search Activity
**POST** `/api/end-user/searches/log`

Log a user search activity for analytics and recommendations.

**Request Body:**
```json
{
  "searchQuery": "honda city 2020",
  "filtersApplied": {
    "priceMin": 500000,
    "priceMax": 1000000,
    "yearMin": 2018,
    "fuelType": "petrol"
  },
  "resultsCount": 25,
  "categoryId": 1,
  "locationFilters": {
    "stateId": 12,
    "cityId": 345
  },
  "priceRange": {
    "min": 500000,
    "max": 1000000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Search logged successfully",
  "data": {
    "searchLogId": 67890
  }
}
```

**Notes:**
- `searchQuery` can be null for category-only searches
- Anonymous users are tracked via session ID
- All fields except `resultsCount` are optional

---

### Get User Search History
**GET** `/api/end-user/searches/history`

Get authenticated user's search history with pagination.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 50)
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Search history retrieved successfully",
  "data": {
    "searches": [
      {
        "id": 67890,
        "userId": 123,
        "sessionId": "sess_abc123",
        "searchQuery": "honda city 2020",
        "filtersApplied": {
          "priceMin": 500000,
          "priceMax": 1000000
        },
        "resultsCount": 25,
        "categoryId": 1,
        "locationFilters": {
          "stateId": 12,
          "cityId": 345
        },
        "priceRange": {
          "min": 500000,
          "max": 1000000
        },
        "createdAt": "2025-01-15T10:30:00Z",
        "category": {
          "id": 1,
          "name": "Cars"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  }
}
```

---

### Get Search Recommendations
**GET** `/api/end-user/searches/recommendations`

Get personalized search recommendations based on user's search history.

**Query Parameters:**
- `limit` (number, optional) - Number of recommendations (default: 5, max: 10)

**Response:**
```json
{
  "success": true,
  "message": "Search recommendations retrieved successfully",
  "data": {
    "topCategories": [
      {
        "categoryId": 1,
        "searchCount": 15
      },
      {
        "categoryId": 2,
        "searchCount": 8
      }
    ],
    "recentQueries": [
      "honda city 2020",
      "maruti swift",
      "toyota innova"
    ]
  }
}
```

---

## Public Endpoints

### Get Popular Searches
**GET** `/api/public/searches/popular`

Get popular search queries across all users (no authentication required).

**Query Parameters:**
- `limit` (number, optional) - Number of results (default: 10, max: 20)
- `categoryId` (number, optional) - Filter by category
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Popular searches retrieved successfully",
  "data": {
    "popularSearches": [
      {
        "searchQuery": "honda city",
        "searchCount": 245,
        "avgResults": "18.50"
      },
      {
        "searchQuery": "maruti swift",
        "searchCount": 189,
        "avgResults": "22.30"
      }
    ]
  }
}
```

---

## Panel Endpoints (Admin/Staff)

### Get Search Analytics
**GET** `/api/panel/searches/analytics`

Get comprehensive search analytics for admin dashboard.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `categoryId` (number, optional) - Filter by category
- `userId` (number, optional) - Filter by specific user

**Response:**
```json
{
  "success": true,
  "message": "Search analytics retrieved successfully",
  "data": {
    "totalSearches": 5420,
    "searchesWithResults": 4890,
    "searchesWithoutResults": 530,
    "successRate": "90.22",
    "avgResults": "16.75",
    "topCategories": [
      {
        "categoryId": 1,
        "searchCount": 2340,
        "category": {
          "name": "Cars"
        }
      }
    ],
    "dailyTrends": [
      {
        "date": "2025-01-15",
        "searchCount": 145
      },
      {
        "date": "2025-01-14",
        "searchCount": 132
      }
    ]
  }
}
```

---

### Get Failed Searches
**GET** `/api/panel/searches/failed`

Get searches that returned no results for content optimization.

**Query Parameters:**
- `limit` (number, optional) - Number of results (default: 20, max: 50)
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)
- `minOccurrences` (number, optional) - Minimum failure count (default: 2)

**Response:**
```json
{
  "success": true,
  "message": "Failed searches retrieved successfully",
  "data": {
    "failedSearches": [
      {
        "searchQuery": "lamborghini aventador",
        "failureCount": 15,
        "lastAttempt": "2025-01-15T14:20:00Z"
      },
      {
        "searchQuery": "ferrari 488",
        "failureCount": 8,
        "lastAttempt": "2025-01-15T12:10:00Z"
      }
    ]
  }
}
```

---

### Get Search Conversion Metrics
**GET** `/api/panel/searches/conversion`

Get search success rates and conversion metrics.

**Query Parameters:**
- `startDate` (string, optional) - Start date (ISO format)
- `endDate` (string, optional) - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "message": "Search conversion metrics retrieved successfully",
  "data": {
    "totalSearches": 5420,
    "searchesWithResults": 4890,
    "searchesWithoutResults": 530,
    "successRate": "90.22",
    "avgResults": "16.75"
  }
}
```

---

### Get User Search Patterns
**GET** `/api/panel/searches/user-patterns/:userId`

Get detailed search patterns for a specific user.

**Query Parameters:**
- `limit` (number, optional) - Number of recent searches (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "User search patterns retrieved successfully",
  "data": {
    "recentSearches": [
      {
        "id": 67890,
        "searchQuery": "honda city 2020",
        "resultsCount": 25,
        "createdAt": "2025-01-15T10:30:00Z",
        "category": {
          "id": 1,
          "name": "Cars"
        }
      }
    ],
    "topCategories": [
      {
        "categoryId": 1,
        "searchCount": 15,
        "category": {
          "name": "Cars"
        }
      }
    ],
    "searchByHour": [
      {
        "hour": 9,
        "searchCount": 5
      },
      {
        "hour": 14,
        "searchCount": 8
      }
    ]
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
  "message": "Invalid search parameters"
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

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to log search activity"
}
```

---

## Frontend Integration Examples

### Search Logging Integration

```javascript
// Log search when user performs search
const performSearch = async (searchParams) => {
  try {
    // Perform actual search
    const searchResults = await searchListings(searchParams);
    
    // Log search activity
    await fetch('/api/end-user/searches/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Optional for anonymous users
      },
      body: JSON.stringify({
        searchQuery: searchParams.query,
        filtersApplied: searchParams.filters,
        resultsCount: searchResults.length,
        categoryId: searchParams.categoryId,
        locationFilters: searchParams.location,
        priceRange: searchParams.priceRange
      })
    });
    
    return searchResults;
  } catch (error) {
    console.error('Search error:', error);
  }
};

// Get search recommendations for autocomplete
const getSearchSuggestions = async () => {
  try {
    const response = await fetch('/api/end-user/searches/recommendations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data.recentQueries;
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
};
```

---

## Notes

- Search logging is non-blocking and should not affect search performance
- Anonymous users are tracked via session ID for basic analytics
- Failed searches help identify content gaps and SEO opportunities
- Search patterns help improve recommendation algorithms
- All timestamps are in ISO 8601 format (UTC)
- Panel endpoints require appropriate role permissions