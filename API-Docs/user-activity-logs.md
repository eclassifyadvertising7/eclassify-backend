# User Activity Logs API Documentation

## Overview
API endpoints for tracking and retrieving user activity logs, including listing views and recently viewed listings.

---

## End-User Endpoints

### Get Recently Viewed Listings

Retrieve listings that the authenticated user has recently viewed, ordered by most recent view first.

**Endpoint:** `GET /api/end-user/activity/recently-viewed`

**Authentication:** Required (JWT token)

**Query Parameters:**
- `page` (optional, integer, default: 1) - Page number for pagination
- `limit` (optional, integer, default: 20, max: 50) - Number of listings per page

**Request Example:**
```http
GET /api/end-user/activity/recently-viewed?page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Recently viewed listings retrieved successfully",
  "data": {
    "listings": [
      {
        "id": 123,
        "userId": 45,
        "categoryId": 1,
        "categorySlug": "cars",
        "title": "2020 BMW 3 Series",
        "slug": "2020-bmw-3-series-abc123",
        "shareCode": "XYZ123",
        "description": "Well maintained BMW 3 Series...",
        "price": "2500000.00",
        "priceNegotiable": false,
        "stateId": 21,
        "cityId": 1234,
        "stateName": "Maharashtra",
        "cityName": "Mumbai",
        "locality": "Andheri West",
        "pincode": "400053",
        "address": "Near Metro Station",
        "latitude": "19.1234567",
        "longitude": "72.8765432",
        "status": "active",
        "isFeatured": false,
        "featuredUntil": null,
        "expiresAt": "2026-03-06T10:30:00.000Z",
        "publishedAt": "2026-02-04T10:30:00.000Z",
        "approvedAt": "2026-02-04T11:00:00.000Z",
        "approvedBy": 1,
        "rejectedAt": null,
        "rejectedBy": null,
        "rejectionReason": null,
        "viewCount": 45,
        "contactCount": 12,
        "totalFavorites": 8,
        "coverImage": "http://localhost:5000/uploads/listings/user-45/images/photo.jpg",
        "coverImageStorageType": "local",
        "coverImageMimeType": "image/jpeg",
        "isAutoApproved": false,
        "postedByType": "owner",
        "userSubscriptionId": 789,
        "isPaidListing": true,
        "keywords": "bmw, 3 series, luxury car",
        "republishCount": 0,
        "lastRepublishedAt": null,
        "republishHistory": null,
        "essentialData": {
          "brand": "BMW",
          "model": "3 Series",
          "year": 2020,
          "fuelType": "Petrol"
        },
        "createdBy": 45,
        "updatedBy": 45,
        "deletedBy": null,
        "deletedAt": null,
        "createdAt": "2026-02-04T10:30:00.000Z",
        "updatedAt": "2026-02-04T10:30:00.000Z",
        "lastViewedAt": "2026-02-04T15:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "currentPage": 1,
      "totalPages": 3
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
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

### Deduplication
- If a user views the same listing multiple times, only the most recent view is returned
- Each listing appears only once in the results

### Listing Fields
- All listing fields are returned as full Sequelize objects
- `coverImage` field uses getter to return full URL based on storage type
- `lastViewedAt` is added to each listing object showing when it was last viewed

### Pagination
- Default limit is 20 listings per page
- Maximum limit is 50 listings per page
- Use `page` parameter to navigate through results

### Listing Status
- Only non-deleted listings are returned
- Includes listings with any status (draft, pending, active, expired, sold, rejected)

### Performance
- Query uses `DISTINCT ON (target_id)` for efficient deduplication
- Existing database indexes on `(user_id, created_at)` optimize performance

---

## Related Endpoints

- `POST /api/end-user/activity/log` - Log user activity (view, chat initiation)
- `GET /api/panel/activity/most-viewed` - Get most viewed listings (admin)
- `GET /api/panel/activity/conversion-rate` - Get view-to-chat conversion rate (admin)
