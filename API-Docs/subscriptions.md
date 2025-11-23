# Subscription Management API Documentation

Complete API documentation for subscription plan management (Super Admin) and user subscriptions (End Users).

---

## Table of Contents

1. [Super Admin - Plan Management](#super-admin---plan-management)
2. [End User - Subscriptions](#end-user---subscriptions)
3. [Data Models](#data-models)
4. [Error Codes](#error-codes)

---

## Super Admin - Plan Management

### 1. Create Subscription Plan

Create a new subscription plan.

**Endpoint:** `POST /api/panel/subscription-plans`

**Authentication:** Required (Super Admin only)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planCode": "premium",
  "name": "Premium Plan",
  "slug": "premium",  // Optional - auto-generated from name if not provided
  "description": "Full-featured premium plan with all benefits",
  "shortDescription": "Best value for serious sellers",
  "basePrice": 999.00,
  "discountAmount": 200.00,
  "finalPrice": 799.00,
  "currency": "INR",
  "billingCycle": "monthly",
  "durationDays": 30,
  "tagline": "Most Popular",
  "showOriginalPrice": true,
  "showOfferBadge": true,
  "offerBadgeText": "20% OFF",
  "sortOrder": 2,
  "maxTotalListings": 50,
  "maxActiveListings": 10,
  "listingQuotaLimit": 10,
  "listingQuotaRollingDays": 30,
  "maxFeaturedListings": 5,
  "maxBoostedListings": 3,
  "maxSpotlightListings": 1,
  "maxHomepageListings": 1,
  "featuredDays": 7,
  "boostedDays": 3,
  "spotlightDays": 1,
  "priorityScore": 80,
  "searchBoostMultiplier": 1.5,
  "recommendationBoostMultiplier": 1.3,
  "crossCityVisibility": true,
  "nationalVisibility": false,
  "autoRenewal": true,
  "maxRenewals": 12,
  "listingDurationDays": 45,
  "autoRefreshEnabled": true,
  "refreshFrequencyDays": 7,
  "manualRefreshPerCycle": 5,
  "supportLevel": "priority",
  "features": {
    "showPhoneNumber": true,
    "showWhatsapp": true,
    "allowChat": true,
    "priorityChatSupport": true,
    "analyticsEnabled": true,
    "viewCountVisible": true,
    "trackLeads": true,
    "sellerVerificationIncluded": true,
    "trustBadge": true,
    "warrantyBadge": false,
    "geoTargetingEnabled": true,
    "radiusTargetingKm": 50,
    "socialSharingEnabled": true,
    "createPromotions": true,
    "autoApproval": false,
    "priorityModeration": true,
    "appealRejectedListings": true
  },
  "availableAddons": [],
  "upsellSuggestions": {},
  "metadata": {},
  "internalNotes": "Premium plan for power users",
  "termsAndConditions": "Terms apply",
  "isActive": true,
  "isPublic": true,
  "isDefault": false,
  "isFeatured": true,
  "isSystemPlan": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": 3,
    "planCode": "premium",
    "version": 1,
    "name": "Premium Plan",
    "slug": "premium",
    "finalPrice": "799.00",
    "isActive": true,
    "isPublic": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing required fields, invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not super admin)

---

### 2. Update Subscription Plan

Update a subscription plan. Automatically creates new version if critical fields are changed.

**Endpoint:** `PUT /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Auto-Versioning Logic:**
- If **critical fields** changed → Creates new version automatically
- If **non-critical fields** changed → Updates in place

**Critical Fields (20 total):**
- Pricing: `basePrice`, `discountAmount`, `finalPrice`, `billingCycle`, `durationDays`
- Quotas: `maxTotalListings`, `maxActiveListings`, `listingQuotaLimit`, `listingQuotaRollingDays`
- Featured: `maxFeaturedListings`, `maxBoostedListings`, `maxSpotlightListings`, `maxHomepageListings`, `featuredDays`, `boostedDays`, `spotlightDays`
- Management: `listingDurationDays`, `autoRenewal`, `maxRenewals`, `supportLevel`

**Request Body (Example - Price Change - Critical Field):**
```json
{
  "finalPrice": 899.00,
  "basePrice": 1099.00,
  "discountAmount": 200.00
}
```

**Success Response - New Version Created (200):**
```json
{
  "success": true,
  "message": "New plan version 2 created successfully",
  "data": {
    "id": 4,
    "planCode": "premium",
    "version": 2,
    "slug": "premium-v2",  // Auto-generated: planCode-v{version}
    "finalPrice": "899.00",
    "isActive": true,
    "isPublic": true,
    "deprecatedAt": null,
    "replacedByPlanId": null
  }
}
```

**Request Body (Example - Non-Critical Fields):**
```json
{
  "name": "Premium Plan - Updated",
  "description": "Updated description",
  "tagline": "Best Value"
}
```

**Success Response - Updated In Place (200):**
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "id": 3,
    "planCode": "premium",
    "version": 1,
    "slug": "premium",  // Slug unchanged
    "name": "Premium Plan - Updated",
    "description": "Updated description"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Plan not found

---

### 3. Get All Plans

Get all subscription plans (including deprecated versions).

**Endpoint:** `GET /api/panel/subscription-plans`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `isActive` (optional) - Filter by active status (`true`/`false`)
- `isPublic` (optional) - Filter by public visibility (`true`/`false`)
- `planCode` (optional) - Filter by plan code

**Example Request:**
```
GET /api/panel/subscription-plans?isActive=true&isPublic=true
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 4,
      "planCode": "premium",
      "version": 2,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "finalPrice": "899.00",
      "isActive": true,
      "isPublic": true,
      "deprecatedAt": null,
      "replacedByPlanId": null,
      "replacementPlan": null
    },
    {
      "id": 3,
      "planCode": "premium",
      "version": 1,
      "name": "Premium Plan",
      "slug": "premium",
      "finalPrice": "799.00",
      "isActive": true,
      "isPublic": false,
      "deprecatedAt": "2025-01-15T11:00:00.000Z",
      "replacedByPlanId": 4,
      "replacementPlan": {
        "id": 4,
        "name": "Premium Plan",
        "slug": "premium-v2",
        "finalPrice": "899.00",
        "version": 2
      }
    }
  ]
}
```

---

### 4. Get Plan by ID

Get detailed information about a specific plan.

**Endpoint:** `GET /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 3,
    "planCode": "premium",
    "version": 1,
    "name": "Premium Plan",
    "slug": "premium",
    "description": "Full-featured premium plan",
    "basePrice": "999.00",
    "discountAmount": "200.00",
    "finalPrice": "799.00",
    "currency": "INR",
    "billingCycle": "monthly",
    "durationDays": 30,
    "maxTotalListings": 50,
    "maxActiveListings": 10,
    "features": { /* ... */ },
    "isActive": true,
    "isPublic": true,
    "deprecatedAt": null,
    "replacedByPlanId": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
- `404` - Plan not found

---

### 5. Delete Plan

Soft delete a subscription plan.

**Endpoint:** `DELETE /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan deleted successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Cannot delete (system plan or has active subscriptions)
- `404` - Plan not found

---

### 6. Update Plan Status

Set plan active/inactive status explicitly.

**Endpoint:** `PATCH /api/panel/subscription-plans/status/:id`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan activated successfully",
  "data": {
    "id": 3,
    "planCode": "premium",
    "isActive": true
  }
}
```

**Error Responses:**
- `400` - Invalid request (isActive must be boolean)
- `404` - Plan not found

---

### 7. Update Plan Visibility

Set plan public/private visibility explicitly.

**Endpoint:** `PATCH /api/panel/subscription-plans/visibility/:id`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "isPublic": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan visibility disabled successfully",
  "data": {
    "id": 3,
    "planCode": "premium",
    "isPublic": false
  }
}
```

**Error Responses:**
- `400` - Invalid request (isPublic must be boolean)
- `404` - Plan not found

---

## End User - Subscriptions

### 1. Get Available Plans

Get all active and public subscription plans.

**Endpoint:** `GET /api/end-user/subscriptions/plans`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "planCode": "basic",
      "version": 1,
      "name": "Basic Plan",
      "slug": "basic",
      "description": "Perfect for getting started",
      "shortDescription": "Essential features for beginners",
      "basePrice": "299.00",
      "discountAmount": "0.00",
      "finalPrice": "299.00",
      "currency": "INR",
      "billingCycle": "monthly",
      "durationDays": 30,
      "tagline": "Best for Beginners",
      "showOriginalPrice": false,
      "showOfferBadge": false,
      "maxTotalListings": 10,
      "maxActiveListings": 3,
      "features": { /* ... */ },
      "sortOrder": 1
    },
    {
      "id": 4,
      "planCode": "premium",
      "version": 2,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "finalPrice": "899.00",
      "tagline": "Most Popular",
      "showOfferBadge": true,
      "offerBadgeText": "20% OFF",
      "sortOrder": 2
    }
  ]
}
```

---

### 2. Get Plan Details

Get detailed information about a specific plan.

**Endpoint:** `GET /api/end-user/subscriptions/plans/:id`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 4,
    "planCode": "premium",
    "version": 2,
    "name": "Premium Plan",
    "slug": "premium-v2",
    "description": "Full-featured premium plan with all benefits",
    "basePrice": "1099.00",
    "discountAmount": "200.00",
    "finalPrice": "899.00",
    "currency": "INR",
    "billingCycle": "monthly",
    "durationDays": 30,
    "maxTotalListings": 50,
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": {
      "showPhoneNumber": true,
      "allowChat": true,
      "analyticsEnabled": true,
      "priorityModeration": true
    },
    "termsAndConditions": "Terms apply"
  }
}
```

**Error Responses:**
- `404` - Plan not found or not available

---

### 3. Subscribe to Plan

Create a new subscription for the authenticated user.

**Endpoint:** `POST /api/end-user/subscriptions`

**Authentication:** Required

**Request Body:**
```json
{
  "planId": 4,
  "paymentData": {
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
    "amountPaid": 899.00,
    "isTrial": false,
    "autoRenew": true,
    "metadata": {
      "orderId": "order_123",
      "paymentGateway": "razorpay"
    }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "startsAt": "2025-01-15T12:00:00.000Z",
    "endsAt": "2025-02-14T12:00:00.000Z",
    "activatedAt": "2025-01-15T12:00:00.000Z",
    "planName": "Premium Plan",
    "planCode": "premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "899.00",
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": { /* snapshot of all plan features */ }
  }
}
```

**Error Responses:**
- `400` - User already has active subscription
- `404` - Plan not found or not available

---

### 4. Get Active Subscription

Get the user's currently active subscription.

**Endpoint:** `GET /api/end-user/subscriptions/active`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "subscription": {
      "id": 15,
      "userId": 42,
      "planId": 4,
      "status": "active",
      "startsAt": "2025-01-15T12:00:00.000Z",
      "endsAt": "2025-02-14T12:00:00.000Z",
      "planName": "Premium Plan",
      "planCode": "premium",
      "planVersion": 2,
      "finalPrice": "899.00",
      "maxActiveListings": 10,
      "maxFeaturedListings": 5,
      "features": { /* ... */ },
      "plan": {
        "id": 4,
        "name": "Premium Plan",
        "slug": "premium-v2",
        "deprecatedAt": null,
        "replacedByPlanId": null
      }
    },
    "upgradeAvailable": null
  }
}
```

**Response with Upgrade Available:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "subscription": { /* ... */ },
    "upgradeAvailable": {
      "id": 5,
      "name": "Premium Plan",
      "slug": "premium-v3",
      "finalPrice": "999.00",
      "version": 3
    }
  }
}
```

**Error Response:**
- `404` - No active subscription found

---

### 5. Get Subscription History

Get user's subscription history with pagination.

**Endpoint:** `GET /api/end-user/subscriptions/history`

**Authentication:** Required

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Example Request:**
```
GET /api/end-user/subscriptions/history?page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 15,
      "planName": "Premium Plan",
      "planCode": "premium",
      "planVersion": 2,
      "status": "active",
      "startsAt": "2025-01-15T12:00:00.000Z",
      "endsAt": "2025-02-14T12:00:00.000Z",
      "finalPrice": "899.00",
      "amountPaid": "899.00"
    },
    {
      "id": 10,
      "planName": "Basic Plan",
      "planCode": "basic",
      "planVersion": 1,
      "status": "expired",
      "startsAt": "2024-12-15T12:00:00.000Z",
      "endsAt": "2025-01-14T12:00:00.000Z",
      "finalPrice": "299.00",
      "amountPaid": "299.00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 6. Cancel Subscription

Cancel the user's active subscription.

**Endpoint:** `POST /api/end-user/subscriptions/:id/cancel`

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Found a better alternative"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": 15,
    "status": "cancelled",
    "cancelledAt": "2025-01-20T10:00:00.000Z",
    "cancellationReason": "Found a better alternative",
    "autoRenew": false
  }
}
```

**Error Responses:**
- `400` - Only active subscriptions can be cancelled
- `403` - Unauthorized (not user's subscription)
- `404` - Subscription not found

---

## Data Models

### Subscription Plan Model

```typescript
{
  id: number,
  planCode: string,           // e.g., "premium"
  version: number,            // e.g., 1, 2, 3
  name: string,
  slug: string,               // e.g., "premium", "premium-v2"
  description: string,
  basePrice: decimal,
  discountAmount: decimal,
  finalPrice: decimal,
  currency: string,           // "INR"
  billingCycle: enum,         // "daily", "weekly", "monthly", "quarterly", "annual", "one_time"
  durationDays: number,
  maxTotalListings: number,
  maxActiveListings: number,
  features: json,
  isActive: boolean,
  isPublic: boolean,
  deprecatedAt: timestamp,
  replacedByPlanId: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### User Subscription Model

```typescript
{
  id: number,
  userId: number,
  planId: number,
  status: enum,               // "pending", "active", "expired", "cancelled", "suspended"
  startsAt: timestamp,
  endsAt: timestamp,
  activatedAt: timestamp,
  planName: string,           // Snapshot
  planCode: string,           // Snapshot
  planVersion: number,        // Snapshot
  finalPrice: decimal,        // Snapshot
  maxActiveListings: number,  // Snapshot
  features: json,             // Snapshot
  paymentMethod: string,
  transactionId: string,
  amountPaid: decimal,
  cancelledAt: timestamp,
  cancellationReason: string,
  createdAt: timestamp
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, invalid data) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Notes

1. **Auto-Versioning**: When updating a plan, if any of the 20 critical fields are changed, a new version is automatically created.

2. **Auto-Generated Slugs**: 
   - On **create**: Slug auto-generated from name if not provided
   - On **update (non-critical)**: Slug remains unchanged (cannot be modified)
   - On **version creation**: Slug auto-generated as `{planCode}-v{version}` (e.g., `premium-v2`)

3. **Immutable Snapshots**: User subscriptions store a complete snapshot of plan benefits at purchase time. Never query the plan table for user benefits.

4. **Deprecated Plans**: Old plan versions remain active but hidden (`isActive: true`, `isPublic: false`) so existing subscribers can still access their benefits.

5. **Upgrade Detection**: When fetching active subscription, the API checks if the plan is deprecated and suggests the replacement plan if available.

6. **Single Active Subscription**: Users can only have one active subscription at a time.

7. **Explicit State Management**: Toggle endpoints (status, visibility) require explicit boolean values in the request body.
