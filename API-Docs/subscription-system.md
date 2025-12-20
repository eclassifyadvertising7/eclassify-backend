# Subscription System API Documentation

Complete API documentation for subscription plan management and user subscriptions with category-based support.

---

## ⚠️ IMPORTANT: Manual Payment Flow (TEMPORARY)

**Current Implementation:** The subscription system currently uses a **manual payment verification flow** where:
1. Users submit payment details (UPI ID, Transaction ID, optional proof)
2. Subscription, Invoice, and Transaction records are created with **PENDING** status
3. Admin manually verifies payment and approves/rejects
4. Upon approval, all records are updated to ACTIVE/PAID/COMPLETED status

**Future Implementation:** This manual flow will be replaced with automated payment gateway integration (Razorpay/Stripe/etc.). The code is structured to make this transition easy:
- Manual payment code is clearly marked with comments
- Payment gateway code is commented out and ready to be uncommented
- The `verifyManualPayment` endpoint will be removed when gateway is implemented

**Toggle Between Flows:** Simply comment/uncomment the respective sections in:
- `src/services/subscriptionService.js` - `subscribeToPlan()` method
- `src/controllers/end-user/subscriptionController.js` - `subscribeToPlan()` method
- `src/routes/panel/subscriptionRoutes.js` - Remove verify-payment route

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
2. [Super Admin - Plan Management](#super-admin---plan-management)
3. [Super Admin - User Subscription Management](#super-admin---user-subscription-management)
4. [End User - Subscriptions](#end-user---subscriptions)
5. [Data Models](#data-models)
6. [Error Codes](#error-codes)

---

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
      "planCode": "cars-basic",
      "version": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "categoryId": 1,
      "finalPrice": "299.00",
      "currency": "INR",
      "durationDays": 30,
      "maxTotalListings": 5,
      "isFreePlan": false,
      "isQuotaBased": true,
      "sortOrder": 1
    }
  ]
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
      "planCode": "cars-basic",
      "categoryId": 1,
      "finalPrice": "299.00",
      "maxTotalListings": 5,
      "featuredDays": 7,
      "features": {
        "autoApproval": true,
        "prioritySupport": false
      }
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
    "planCode": "cars-basic",
    "version": 1,
    "name": "Cars Basic Plan",
    "slug": "cars-basic",
    "description": "Perfect for individual car sellers",
    "categoryId": 1,
    "finalPrice": "299.00",
    "currency": "INR",
    "durationDays": 30,
    "maxTotalListings": 5,
    "listingDurationDays": 30,
    "features": {
      "autoApproval": true,
      "prioritySupport": false,
      "showPhoneNumber": true,
      "allowChat": true
    },
    "termsAndConditions": "Terms apply"
  }
}
```

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
  "planCode": "cars-premium",
  "name": "Cars Premium Plan",
  "slug": "cars-premium",
  "description": "Full-featured premium plan for car sellers",
  "shortDescription": "Best value for serious car sellers",
  "categoryId": 1,
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
  "isFreePlan": false,
  "isQuotaBased": true,
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
    "planCode": "cars-premium",
    "version": 1,
    "name": "Cars Premium Plan",
    "slug": "cars-premium",
    "categoryId": 1,
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
    "planCode": "cars-premium",
    "version": 2,
    "slug": "cars-premium-v2",
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
  "name": "Cars Premium Plan - Updated",
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
    "planCode": "cars-premium",
    "version": 1,
    "slug": "cars-premium",
    "name": "Cars Premium Plan - Updated",
    "description": "Updated description"
  }
}
```

---

### 3. Get All Plans

Get all subscription plans (including deprecated versions).

**Endpoint:** `GET /api/panel/subscription-plans`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `isActive` (optional) - Filter by active status (`true`/`false`)
- `isPublic` (optional) - Filter by public visibility (`true`/`false`)
- `planCode` (optional) - Filter by plan code
- `categoryId` (optional) - Filter by category ID

**Example Request:**
```
GET /api/panel/subscription-plans?isActive=true&categoryId=1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 4,
      "planCode": "cars-premium",
      "version": 2,
      "name": "Cars Premium Plan",
      "slug": "cars-premium-v2",
      "categoryId": 1,
      "finalPrice": "899.00",
      "isActive": true,
      "isPublic": true,
      "deprecatedAt": null,
      "replacedByPlanId": null,
      "replacementPlan": null
    },
    {
      "id": 3,
      "planCode": "cars-premium",
      "version": 1,
      "name": "Cars Premium Plan",
      "slug": "cars-premium",
      "categoryId": 1,
      "finalPrice": "799.00",
      "isActive": true,
      "isPublic": false,
      "deprecatedAt": "2025-01-15T11:00:00.000Z",
      "replacedByPlanId": 4,
      "replacementPlan": {
        "id": 4,
        "name": "Cars Premium Plan",
        "slug": "cars-premium-v2",
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
    "planCode": "cars-premium",
    "version": 1,
    "name": "Cars Premium Plan",
    "slug": "cars-premium",
    "description": "Full-featured premium plan for car sellers",
    "categoryId": 1,
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
    "isFreePlan": false,
    "isQuotaBased": true,
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
    "planCode": "cars-premium",
    "isActive": true
  }
}
```

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
    "planCode": "cars-premium",
    "isPublic": false
  }
}
```

---

## Super Admin - User Subscription Management

Manage user subscriptions (assign plans, update status, extend subscriptions).

### 1. Get All User Subscriptions

Get all user subscriptions with filters and pagination.

**Endpoint:** `GET /api/panel/subscriptions`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `status` (optional) - Filter by status (`pending`, `active`, `expired`, `cancelled`, `suspended`)
- `userId` (optional) - Filter by user ID
- `planId` (optional) - Filter by plan ID
- `categoryId` (optional) - Filter by category ID
- `dateFrom` (optional) - Filter from date (ISO 8601 format)
- `dateTo` (optional) - Filter to date (ISO 8601 format)
- `search` (optional) - Search by user name or mobile
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Example Request:**
```
GET /api/panel/subscriptions?status=active&categoryId=1&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 15,
      "userId": 42,
      "planId": 4,
      "status": "active",
      "endsAt": "2025-02-14T12:00:00.000Z",
      "activatedAt": "2025-01-15T12:00:00.000Z",
      "planName": "Cars Premium Plan",
      "planCode": "cars-premium",
      "planVersion": 2,
      "finalPrice": "899.00",
      "amountPaid": "899.00",
      "user": {
        "id": 42,
        "fullName": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com"
      },
      "plan": {
        "id": 4,
        "name": "Cars Premium Plan",
        "slug": "cars-premium-v2",
        "planCode": "cars-premium",
        "version": 2,
        "categoryId": 1
      },
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 2. Get Subscriptions by Category (Admin)

Get subscriptions for specific category with filtering.

**Endpoint:** `GET /api/panel/subscriptions/category/:categoryId`

**Authentication:** Required (Super Admin only)

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

### 3. Create Subscription Manually (Admin)

Manually assign a subscription plan to a user (admin assignment).

**Endpoint:** `POST /api/panel/subscriptions`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "userId": 42,
  "planId": 4,
  "endsAt": "2025-02-19T23:59:59.000Z",
  "notes": "Complimentary subscription for beta tester"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 20,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "endsAt": "2025-02-19T23:59:59.000Z",
    "activatedAt": "2025-01-20T10:30:00.000Z",
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "paymentMethod": "manual",
    "amountPaid": "0.00",
    "notes": "Complimentary subscription for beta tester",
    "metadata": {
      "assignedBy": "admin",
      "adminUserId": 1
    }
  }
}
```

---

### 4. Update Subscription Status (Admin)

Update subscription status explicitly.

**Endpoint:** `PATCH /api/panel/subscriptions/status/:id`

**Authentication:** Required (Super Admin only)

**Path Parameters:**
- `id` (integer, required): Subscription ID

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Valid Status Values:**
- `pending` - Subscription pending activation
- `active` - Active subscription
- `expired` - Subscription expired
- `cancelled` - Subscription cancelled
- `suspended` - Subscription suspended

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription status updated to suspended",
  "data": {
    "id": 15,
    "userId": 42,
    "status": "suspended",
    "updatedAt": "2025-01-20T12:00:00.000Z"
  }
}
```

---

### 5. Extend Subscription (Admin)

Extend subscription duration by specified days.

**Endpoint:** `POST /api/panel/subscriptions/:id/extend`

**Authentication:** Required (Super Admin only)

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
    "id": 15,
    "userId": 42,
    "endsAt": "2025-03-01T12:00:00.000Z",
    "notes": "Extended by 30 days on 2025-01-20T12:30:00.000Z",
    "updatedAt": "2025-01-20T12:30:00.000Z"
  }
}
```

---

### 6. Verify Manual Payment (TEMPORARY)

Verify manual payment and activate or reject subscription. This endpoint will be removed when payment gateway is implemented.

**Endpoint:** `POST /api/panel/subscriptions/:id/verify-payment`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "approved": true,
  "notes": "Payment verified via bank statement"
}
```

**Success Response - Approved (200):**
```json
{
  "success": true,
  "message": "Payment verified and subscription activated successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "endsAt": "2025-02-19T10:00:00.000Z",
    "activatedAt": "2025-01-20T10:00:00.000Z",
    "amountPaid": "899.00",
    "notes": "Payment verified via bank statement"
  }
}
```

**Request Body - Rejected:**
```json
{
  "approved": false,
  "notes": "Invalid transaction ID"
}
```

**Success Response - Rejected (200):**
```json
{
  "success": true,
  "message": "Payment rejected and subscription cancelled",
  "data": {
    "id": 15,
    "userId": 42,
    "status": "cancelled",
    "cancelledAt": "2025-01-20T10:00:00.000Z",
    "cancellationReason": "Invalid transaction ID"
  }
}
```

---

## End User - Subscriptions

### 1. Get Available Plans (Authenticated)

Get all available plans for authenticated users.

**Endpoint:** `GET /api/end-user/subscriptions/plans`

**Authentication:** Required

**Query Parameters:**
- `categoryId` (optional) - Filter by category ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "planCode": "cars-basic",
      "version": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "description": "Perfect for getting started with car listings",
      "shortDescription": "Essential features for beginners",
      "categoryId": 1,
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
    }
  ]
}
```

---

### 2. Get Plans by Category (Authenticated)

Get plans for specific category for authenticated users.

**Endpoint:** `GET /api/end-user/subscriptions/plans/category/:categoryId`

**Authentication:** Required

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
      "planCode": "cars-basic",
      "categoryId": 1,
      "finalPrice": "299.00",
      "maxTotalListings": 5,
      "featuredDays": 7,
      "features": {
        "autoApproval": true,
        "prioritySupport": false
      }
    }
  ]
}
```

---

### 3. Get Plan Details

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
    "planCode": "cars-premium",
    "version": 2,
    "name": "Cars Premium Plan",
    "slug": "cars-premium-v2",
    "description": "Full-featured premium plan with all benefits",
    "categoryId": 1,
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

---

### 4. Subscribe to Plan (Manual Payment - TEMPORARY)

Create a new subscription for the authenticated user with manual payment verification.

**Endpoint:** `POST /api/end-user/subscriptions`

**Authentication:** Required

**Flow:**
1. User selects plan and clicks subscribe
2. QR code appears on screen
3. User makes payment via UPI
4. User clicks "Complete Payment"
5. Form appears - user enters UPI ID, Transaction ID, and optional payment proof
6. User submits form
7. Entries created with PENDING status in user_subscriptions, invoices, and transactions tables
8. Admin manually verifies payment and activates subscription

**Request Body (Manual Payment):**
```json
{
  "planId": 4,
  "upiId": "user@paytm",
  "transactionId": "T2025011512345678",
  "paymentProof": "https://example.com/proof.jpg",
  "customerName": "John Doe",
  "customerMobile": "9876543210"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription request submitted successfully. Pending admin verification.",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "pending",
    "endsAt": null,
    "activatedAt": null,
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "0.00",
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": { /* snapshot of all plan features */ },
    "metadata": {
      "upiId": "user@paytm",
      "paymentProof": "https://example.com/proof.jpg",
      "submittedAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

---

### 5. Get My Active Subscription by Category

Get user's active subscription for specific category.

**Endpoint:** `GET /api/end-user/subscriptions/active/category/:categoryId`

**Authentication:** Required

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

### 6. Get All My Active Subscriptions

Get all user's active subscriptions across categories.

**Endpoint:** `GET /api/end-user/subscriptions/active/all`

**Authentication:** Required

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

### 7. Get Active Subscription

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
      "planName": "Cars Premium Plan",
      "planCode": "cars-premium",
      "planVersion": 2,
      "finalPrice": "899.00",
      "maxActiveListings": 10,
      "maxFeaturedListings": 5,
      "features": { /* ... */ },
      "plan": {
        "id": 4,
        "name": "Cars Premium Plan",
        "slug": "cars-premium-v2",
        "deprecatedAt": null,
        "replacedByPlanId": null
      }
    },
    "upgradeAvailable": null
  }
}
```

---

### 8. Get My Subscription History

Get user's subscription history with pagination.

**Endpoint:** `GET /api/end-user/subscriptions/history`

**Authentication:** Required

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

### 9. Get All My Subscriptions

Get all my subscriptions with optional status filter and pagination.

**Endpoint:** `GET /api/end-user/subscriptions`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status (`pending`, `active`, `expired`, `cancelled`, `suspended`)
- `categoryId` (optional) - Filter by category ID
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 15,
      "userId": 42,
      "planId": 4,
      "status": "active",
      "startsAt": "2025-01-15T12:00:00.000Z",
      "endsAt": "2025-02-14T12:00:00.000Z",
      "planName": "Cars Premium Plan",
      "planCode": "cars-premium",
      "planVersion": 2,
      "finalPrice": "899.00",
      "amountPaid": "899.00",
      "plan": {
        "id": 4,
        "name": "Cars Premium Plan",
        "slug": "cars-premium-v2",
        "planCode": "cars-premium",
        "version": 2,
        "categoryId": 1
      },
      "createdAt": "2025-01-15T12:00:00.000Z"
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

### 10. Cancel Subscription

Cancel user's active subscription.

**Endpoint:** `POST /api/end-user/subscriptions/:id/cancel`

**Authentication:** Required

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

## Data Models

### Subscription Plan Model

```typescript
{
  id: number,
  planCode: string,           // e.g., "cars-premium"
  version: number,            // e.g., 1, 2, 3
  name: string,
  slug: string,               // e.g., "cars-premium", "cars-premium-v2"
  description: string,
  categoryId: number,         // Category this plan belongs to
  basePrice: decimal,
  discountAmount: decimal,
  finalPrice: decimal,
  currency: string,           // "INR"
  billingCycle: enum,         // "daily", "weekly", "monthly", "quarterly", "annual", "one_time"
  durationDays: number,
  maxTotalListings: number,
  maxActiveListings: number,
  isFreePlan: boolean,        // true for free plans, false for paid plans
  isQuotaBased: boolean,      // true for quota-based plans, false for time-based plans
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

---

## Notes

### Category-Based Subscriptions

1. **Category Support**: All subscription plans are now category-specific (Cars, Properties, etc.)
2. **Multiple Active Subscriptions**: Users can have one active subscription per category
3. **Category Filtering**: All endpoints support filtering by categoryId
4. **Free Plans**: Each category can have a default free plan for users without paid subscriptions

### Subscription Plans

5. **Auto-Versioning**: When updating a plan, if any of the 20 critical fields are changed, a new version is automatically created.
6. **Auto-Generated Slugs**: 
   - On **create**: Slug auto-generated from name if not provided
   - On **update (non-critical)**: Slug remains unchanged (cannot be modified)
   - On **version creation**: Slug auto-generated as `{planCode}-v{version}` (e.g., `cars-premium-v2`)
7. **Deprecated Plans**: Old plan versions remain active but hidden (`isActive: true`, `isPublic: false`) so existing subscribers can still access their benefits.

### User Subscriptions

8. **Immutable Snapshots**: User subscriptions store a complete snapshot of plan benefits at purchase time. Never query the plan table for user benefits.
9. **Category-Specific Active Subscriptions**: Users can only have one active subscription per category at a time.
10. **Upgrade Detection**: When fetching active subscription, the API checks if the plan is deprecated and suggests the replacement plan if available.
11. **Manual Assignment**: Super admins can manually assign subscriptions to users without payment (useful for complimentary plans, beta testers, etc.).