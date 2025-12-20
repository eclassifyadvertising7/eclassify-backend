# Subscription System API Documentation

## Overview
Category-specific subscription system supporting Cars and Properties with quota-based and time-based plans.

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Public Endpoints

### Get Available Plans
**GET** `/api/public/subscription-plans`

Get all active and public subscription plans.

**Query Parameters:**
- None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "planCode": "CARS_BASIC",
      "categoryId": 1,
      "finalPrice": 299.00,
      "currency": "INR",
      "durationDays": 30,
      "maxTotalListings": 5,
      "isFreePlan": false,
      "isQuotaBased": true
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

### Get Plans by Category
**GET** `/api/public/subscription-plans/category/:categoryId`

Get subscription plans for a specific category.

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "planCode": "CARS_BASIC",
      "categoryId": 1,
      "finalPrice": 299.00,
      "maxTotalListings": 5,
      "featuredDays": 7
    }
  ]
}
```

---

### Get Plan Details
**GET** `/api/public/subscription-plans/:id`

Get detailed information about a specific plan.

**Path Parameters:**
- `id` (integer, required): Plan ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 1,
    "name": "Cars Basic Plan",
    "description": "Perfect for individual car sellers",
    "finalPrice": 299.00,
    "features": {
      "autoApproval": true,
      "prioritySupport": false
    },
    "maxTotalListings": 5,
    "listingDurationDays": 30
  }
}
```

---

## End-User Endpoints

### Get Available Plans (Authenticated)
**GET** `/api/end-user/subscriptions/plans`

Get all available plans for authenticated users.

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars Basic Plan",
      "finalPrice": 299.00,
      "categoryId": 1
    }
  ]
}
```

---

### Get Plans by Category (Authenticated)
**GET** `/api/end-user/subscriptions/plans/category/:categoryId`

Get plans for specific category for authenticated users.

**Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars Basic Plan",
      "finalPrice": 299.00,
      "maxTotalListings": 5
    }
  ]
}
```

---

### Subscribe to Plan
**POST** `/api/end-user/subscriptions`

Subscribe user to a specific plan.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "planId": 1,
  "paymentData": {
    "paymentMethod": "razorpay",
    "transactionId": "pay_123456789",
    "customerName": "John Doe",
    "customerMobile": "9876543210"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "planId": 1,
    "status": "active",
    "startsAt": "2024-01-01T00:00:00.000Z",
    "endsAt": "2024-01-31T00:00:00.000Z"
  }
}
```

---

### Get My Active Subscription by Category
**GET** `/api/end-user/subscriptions/active/category/:categoryId`

Get user's active subscription for specific category.

**Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "planName": "Cars Basic Plan",
      "maxTotalListings": 5,
      "endsAt": "2024-01-31T00:00:00.000Z"
    },
    "needsSubscription": false
  }
}
```

**Response when no subscription (200):**
```json
{
  "success": true,
  "message": "User is on free plan for this category",
  "data": {
    "subscription": null,
    "freePlan": {
      "id": 2,
      "name": "Cars Free Plan",
      "maxTotalListings": 2
    },
    "needsSubscription": true
  }
}
```

---

### Get All My Active Subscriptions
**GET** `/api/end-user/subscriptions/active/all`

Get all user's active subscriptions across categories.

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "status": "active",
        "plan": {
          "name": "Cars Basic Plan",
          "categoryId": 1
        }
      }
    ],
    "totalActive": 1
  }
}
```

---

### Get My Subscription History
**GET** `/api/end-user/subscriptions/history`

Get user's subscription history with pagination.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "planName": "Cars Basic Plan",
      "status": "expired",
      "startsAt": "2024-01-01T00:00:00.000Z",
      "endsAt": "2024-01-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Cancel Subscription
**POST** `/api/end-user/subscriptions/:id/cancel`

Cancel user's active subscription.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id` (integer, required): Subscription ID

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled",
    "cancelledAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Admin Panel Endpoints

### Get All Subscriptions (Admin)
**GET** `/api/panel/subscriptions`

Get all user subscriptions with filtering and pagination.

**Headers:**
- `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, active, expired, cancelled, suspended)
- `userId` (integer, optional): Filter by user ID
- `planId` (integer, optional): Filter by plan ID
- `dateFrom` (string, optional): Filter from date (YYYY-MM-DD)
- `dateTo` (string, optional): Filter to date (YYYY-MM-DD)
- `search` (string, optional): Search by user name or mobile
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "active",
      "user": {
        "id": 123,
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "plan": {
        "name": "Cars Basic Plan",
        "planCode": "CARS_BASIC"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Get Subscriptions by Category (Admin)
**GET** `/api/panel/subscriptions/category/:categoryId`

Get subscriptions for specific category with filtering.

**Headers:**
- `Authorization: Bearer <admin_token>`

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Query Parameters:**
- `status` (string, optional): Filter by status
- `userId` (integer, optional): Filter by user ID
- `search` (string, optional): Search by user name or mobile
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "active",
      "user": {
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "plan": {
        "name": "Cars Basic Plan",
        "categoryId": 1
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### Create Subscription Manually (Admin)
**POST** `/api/panel/subscriptions`

Create subscription manually for a user.

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "userId": 123,
  "planId": 1,
  "startsAt": "2024-01-01T00:00:00.000Z",
  "endsAt": "2024-01-31T00:00:00.000Z",
  "notes": "Manually assigned by admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "planId": 1,
    "status": "active",
    "paymentMethod": "manual"
  }
}
```

---

### Update Subscription Status (Admin)
**PATCH** `/api/panel/subscriptions/status/:id`

Update subscription status.

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id` (integer, required): Subscription ID

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription status updated to suspended",
  "data": {
    "id": 1,
    "status": "suspended"
  }
}
```

---

### Extend Subscription (Admin)
**POST** `/api/panel/subscriptions/:id/extend`

Extend subscription duration.

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Path Parameters:**
- `id` (integer, required): Subscription ID

**Request Body:**
```json
{
  "extensionDays": 30
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription extended by 30 days",
  "data": {
    "id": 1,
    "endsAt": "2024-02-29T00:00:00.000Z"
  }
}
```

---

## Error Responses

### Common Error Codes
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Status Values

### Subscription Status
- `pending`: Payment pending or awaiting approval
- `active`: Currently active subscription
- `expired`: Subscription has expired
- `cancelled`: User cancelled subscription
- `suspended`: Admin suspended subscription

### Plan Types
- `isFreePlan`: true for free plans, false for paid plans
- `isQuotaBased`: true for quota-based plans, false for time-based plans