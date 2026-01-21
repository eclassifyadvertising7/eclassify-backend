# Subscription Listings API Documentation

## Overview

Authenticated endpoints for end users to view their own listings organized by subscription. These endpoints help users track which listings they posted under specific subscription plans and monitor their quota usage.

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Subscription Listings

**Endpoint**: `GET /api/end-user/subscriptions/:subscriptionId/listings`

**Description**: Retrieve paginated listings that the authenticated user posted under a specific subscription.

**Parameters**:
- `subscriptionId` (path, required): Subscription ID to fetch listings for
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20, max: 50)
- `status` (query, optional): Filter by status - 'all', 'active', 'sold', 'expired', 'rejected', 'pending', 'draft' (default: 'all')

**Request Example**:
```
GET /api/end-user/subscriptions/15/listings?page=1&limit=10&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example**:
```json
{
  "success": true,
  "message": "Subscription listings retrieved successfully",
  "data": {
    "subscription": {
      "id": 15,
      "planName": "Premium Plan",
      "status": "active",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-02-01T00:00:00Z",
      "listingQuota": 50,
      "usedQuota": 11
    },
    "stats": {
      "total": 15,
      "active": 8,
      "sold": 2,
      "expired": 1,
      "rejected": 2,
      "pending": 1,
      "draft": 1,
      "quotaConsuming": 11
    },
    "listings": [
      {
        "id": 101,
        "title": "Toyota Camry 2020",
        "price": 25000,
        "status": "active",
        "categoryName": "Cars",
        "location": "Downtown Manhattan",
        "createdAt": "2024-01-15T10:30:00Z",
        "expiresAt": "2024-02-15T10:30:00Z",
        "featuredImage": "https://example.com/image1.jpg",
        "viewCount": 45,
        "contactCount": 8
      },
      {
        "id": 102,
        "title": "Honda Civic 2019",
        "price": 22000,
        "status": "sold",
        "categoryName": "Cars",
        "location": "Beverly Hills",
        "createdAt": "2024-01-12T14:20:00Z",
        "expiresAt": "2024-02-12T14:20:00Z",
        "featuredImage": "https://example.com/image2.jpg",
        "viewCount": 67,
        "contactCount": 15
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

### 2. Get Subscription Summary

**Endpoint**: `GET /api/end-user/subscriptions/summary`

**Description**: Get a summary of all user's subscriptions with listing counts and quota usage.

**Parameters**: None

**Request Example**:
```
GET /api/end-user/subscriptions/summary
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example**:
```json
{
  "success": true,
  "message": "Subscription summary retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": 15,
        "planName": "Premium Plan",
        "status": "active",
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-02-01T00:00:00Z",
        "listingQuota": 50,
        "usedQuota": 11,
        "remainingQuota": 39
      },
      {
        "id": 12,
        "planName": "Basic Plan",
        "status": "expired",
        "startDate": "2023-12-01T00:00:00Z",
        "endDate": "2024-01-01T00:00:00Z",
        "listingQuota": 10,
        "usedQuota": 8,
        "remainingQuota": 2
      },
      {
        "id": 8,
        "planName": "Free Plan",
        "status": "expired",
        "startDate": "2023-11-01T00:00:00Z",
        "endDate": "2023-12-01T00:00:00Z",
        "listingQuota": 3,
        "usedQuota": 3,
        "remainingQuota": 0
      }
    ]
  }
}
```

## Field Mapping Notes

- `location`: Maps to `locality` field from the database (represents neighborhood/area within a city)
- `categoryName`: From the associated `categories` table
- `createdAt`/`expiresAt`: Timestamp fields are aliased from snake_case database columns (`created_at`, `expires_at`)
- `featuredImage`: Primary image from `listing_media` table where `is_primary = true`
- `viewCount`/`contactCount`: Performance metrics from the listings table

## Status Definitions

- **active**: Listing is live and not expired
- **sold**: Listing has been marked as sold
- **expired**: Listing has passed its expiration date or manually expired
- **rejected**: Listing was rejected during moderation (does not consume quota)
- **pending**: Listing is awaiting approval (does not consume quota)
- **draft**: Listing is saved as draft (does not consume quota)

## Subscription Status Definitions

- **active**: Subscription is currently active
- **expired**: Subscription has ended
- **cancelled**: Subscription was cancelled by user
- **suspended**: Subscription was suspended by admin
- **pending**: Subscription is awaiting activation

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Subscription not found or access denied"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid subscription ID"
}
```

```json
{
  "success": false,
  "message": "Invalid status. Must be one of: all, active, sold, expired, rejected, pending, draft"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve subscription listings"
}
```

## Usage Notes

1. **Authentication Required**: All endpoints require valid JWT token
2. **Ownership Verification**: Users can only access their own subscriptions and listings
3. **Quota Tracking**: Shows used vs available quota for each subscription
4. **Performance**: Results are paginated and optimized with proper indexing
5. **Status Filtering**: Filter listings by status to focus on specific types

## Business Logic

### Quota Calculation Rules

**Important**: Only successfully published listings consume subscription quota.

**Quota-Consuming Statuses**:
- ✅ **Active**: Live listings (count toward quota)
- ✅ **Sold**: Successfully sold listings (count toward quota)  
- ✅ **Expired**: Listings that were published but expired (count toward quota)

**Non-Quota-Consuming Statuses**:
- ❌ **Draft**: Saved but never published (do not count toward quota)
- ❌ **Pending**: Awaiting approval, not yet published (do not count toward quota)
- ❌ **Rejected**: Failed moderation, never published (do not count toward quota)

**Quota Calculation**:
```javascript
usedQuota = activeListings + soldListings + expiredListings
remainingQuota = subscriptionQuota - usedQuota
```

**Rationale**: Users should only be charged quota for listings that were successfully published and visible to buyers. Drafts, pending approvals, and rejected listings never reached the marketplace, so they shouldn't consume the user's paid quota.

### Quota Calculation
- `usedQuota`: Number of quota-consuming listings (active + sold + expired)
- `remainingQuota`: `listingQuota - usedQuota` (minimum 0)
- Quota is based on `maxTotalListings` or `listingQuotaLimit` from subscription

### Listing Status Logic
- **Active**: `status = 'active'` AND `expiresAt > NOW()`
- **Expired**: `status = 'expired'` OR (`status = 'active'` AND `expiresAt <= NOW()`)
- **Sold/Rejected/Pending**: Direct status match

### Subscription Ownership
- Users can only access subscriptions where `userId` matches their authenticated user ID
- Prevents unauthorized access to other users' subscription data

## Use Cases

1. **Quota Management**: Track how many listings posted vs quota limit
2. **Performance Analysis**: View listing performance (views, contacts) by subscription
3. **Subscription ROI**: Analyze which subscription plans generated better results
4. **Listing History**: See all listings posted under expired subscriptions
5. **Status Monitoring**: Track listing approval status and expiration dates

## Future Enhancements

- Export subscription listing reports
- Subscription performance analytics
- Listing renewal recommendations
- Quota usage alerts
- Subscription upgrade suggestions based on usage patterns