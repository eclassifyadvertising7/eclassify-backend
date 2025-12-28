# Dashboard API Documentation

## Overview

Dashboard endpoints provide statistics and analytics for super admin and admin users. These endpoints aggregate data from users, listings, transactions, and subscriptions.

## Base URL

```
/api/panel/dashboard
```

## Authentication

All dashboard endpoints require:
- Valid JWT token in Authorization header
- User role: `super_admin` or `admin`

## Endpoints

### 1. Get Overview Statistics

Get high-level overview statistics for the platform.

**Endpoint:** `GET /api/panel/dashboard/overview`

**Authentication:** Required (super_admin, admin)

**Response:**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "users": {
      "total": 1250,
      "active": 1100,
      "inactive": 150
    },
    "listings": {
      "total": 5430,
      "active": 3200,
      "sold": 1800,
      "pending": 430
    },
    "revenue": {
      "total": 2500000,
      "currency": "INR"
    },
    "subscriptionPlans": {
      "total": 8,
      "active": 6
    },
    "subscriptions": {
      "active": 850
    }
  }
}
```

**Response Fields:**

- `users.total` - Total number of registered users
- `users.active` - Number of active users
- `users.inactive` - Number of inactive users
- `listings.total` - Total number of listings (all statuses)
- `listings.active` - Number of active listings
- `listings.sold` - Number of sold listings
- `listings.pending` - Number of pending approval listings
- `revenue.total` - Total revenue generated (in smallest currency unit)
- `revenue.currency` - Currency code
- `subscriptionPlans.total` - Total subscription plans
- `subscriptionPlans.active` - Active subscription plans
- `subscriptions.active` - Number of active user subscriptions

### 2. Get Detailed Statistics

Get detailed statistics with period filtering and additional data.

**Endpoint:** `GET /api/panel/dashboard/detailed`

**Authentication:** Required (super_admin, admin)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | string | No | all | Time period: `all`, `today`, `week`, `month`, `year` |

**Example Request:**

```
GET /api/panel/dashboard/detailed?period=month
```

**Response:**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "period": "month",
    "listingsByStatus": [
      { "status": "draft", "count": 120 },
      { "status": "pending", "count": 430 },
      { "status": "active", "count": 3200 },
      { "status": "expired", "count": 250 },
      { "status": "sold", "count": 1800 },
      { "status": "rejected", "count": 80 }
    ],
    "revenue": {
      "amount": 450000,
      "currency": "INR",
      "period": "month"
    },
    "recentTransactions": [
      {
        "id": 1234,
        "amount": 5000,
        "currency": "INR",
        "status": "completed",
        "transactionType": "payment",
        "completedAt": "2025-01-15T10:30:00Z",
        "user": {
          "id": 567,
          "fullName": "John Doe",
          "mobile": "9876543210"
        }
      }
    ],
    "recentListings": [
      {
        "id": 8901,
        "title": "2020 Honda City",
        "price": 850000,
        "status": "active",
        "createdAt": "2025-01-15T09:00:00Z",
        "user": {
          "id": 567,
          "fullName": "John Doe",
          "mobile": "9876543210"
        }
      }
    ]
  }
}
```

**Response Fields:**

- `period` - Selected time period
- `listingsByStatus` - Array of listing counts grouped by status
- `revenue.amount` - Revenue for the selected period
- `revenue.period` - Period for which revenue is calculated
- `recentTransactions` - Last 10 completed transactions
- `recentListings` - Last 10 created listings

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid period. Must be one of: all, today, week, month, year"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to fetch dashboard overview"
}
```

## Usage Examples

### Get Overview Statistics

```javascript
const response = await fetch('/api/panel/dashboard/overview', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
const data = await response.json();
```

### Get Monthly Statistics

```javascript
const response = await fetch('/api/panel/dashboard/detailed?period=month', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
const data = await response.json();
```

## Notes

- All revenue amounts are in the smallest currency unit (paise for INR)
- Only completed transactions are included in revenue calculations
- Soft-deleted records are excluded from all counts
- Recent transactions and listings are limited to 10 items each
- Period filtering applies only to revenue calculations in detailed stats
