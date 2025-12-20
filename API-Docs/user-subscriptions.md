# User Subscriptions API Documentation

Complete API documentation for user subscription management with category-based support.

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

1. [Super Admin - User Subscription Management](#super-admin---user-subscription-management)
2. [End User - Subscriptions](#end-user---subscriptions)
3. [Data Models](#data-models)
4. [Error Codes](#error-codes)

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
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

### 2. Get Subscription by ID

Get detailed information about a specific user subscription.

**Endpoint:** `GET /api/panel/subscriptions/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "startsAt": "2025-01-15T12:00:00.000Z",
    "endsAt": "2025-02-14T12:00:00.000Z",
    "activatedAt": "2025-01-15T12:00:00.000Z",
    "isTrial": false,
    "autoRenew": true,
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "planVersion": 2,
    "basePrice": "1099.00",
    "discountAmount": "200.00",
    "finalPrice": "899.00",
    "currency": "INR",
    "durationDays": 30,
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": {
      "showPhoneNumber": true,
      "allowChat": true,
      "analyticsEnabled": true
    },
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
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
      "finalPrice": "899.00"
    },
    "previousSubscription": null,
    "notes": "Subscribed via online payment",
    "metadata": {},
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Response:**
- `404` - Subscription not found

---

### 3. Get Subscriptions by Category (Admin)

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

### 4. Create Subscription Manually (Admin)

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

**Error Responses:**
- `400` - User already has active subscription for this category
- `400` - User ID and Plan ID are required
- `404` - Plan not found

---

### 5. Update Subscription

Update subscription details.

**Endpoint:** `PUT /api/panel/subscriptions/:id`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "status": "suspended",
  "endsAt": "2025-03-15T23:59:59.000Z",
  "autoRenew": false,
  "notes": "Suspended due to payment issue"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "status": "suspended",
    "endsAt": "2025-03-15T23:59:59.000Z",
    "autoRenew": false,
    "notes": "Suspended due to payment issue",
    "updatedAt": "2025-01-20T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid subscription status
- `404` - Subscription not found

---

### 6. Delete Subscription

Soft delete a subscription.

**Endpoint:** `DELETE /api/panel/subscriptions/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription deleted successfully",
  "data": null
}
```

**Error Response:**
- `404` - Subscription not found

---

### 7. Update Subscription Status (Admin)

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

**Error Responses:**
- `400` - Invalid subscription status
- `404` - Subscription not found

---

### 8. Extend Subscription (Admin)

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

**Error Responses:**
- `400` - Extension days must be at least 1
- `404` - Subscription not found

---

### 9. Verify Manual Payment (TEMPORARY)

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

**What Happens on Approval:**
1. Subscription status changed from `pending` to `active`
2. `activatedAt` set to current time
3. `endsAt` calculated based on plan duration
4. `amountPaid` set to plan's finalPrice
5. Invoice status changed from `pending` to `paid`
6. Invoice `amountPaid` updated, `amountDue` set to 0
7. Transaction status changed from `pending` to `completed`
8. Transaction `verifiedBy`, `verifiedAt`, and `verificationNotes` updated

**What Happens on Rejection:**
1. Subscription status changed from `pending` to `cancelled`
2. `cancelledAt` set to current time
3. `cancellationReason` set from notes
4. Invoice status changed to `cancelled`
5. Transaction status changed to `failed`
6. Transaction `failureReason` set from notes

**Error Responses:**
- `400` - Approved status (true/false) is required
- `400` - Only pending subscriptions can be verified
- `404` - Subscription not found

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

**Error Responses:**
- `400` - User already has active subscription for this category
- `400` - UPI ID and Transaction ID are required
- `404` - Plan not found or not available

---

### 4b. Subscribe to Plan (Payment Gateway - TO BE IMPLEMENTED)

**Note:** This section is commented out in code. Uncomment when implementing payment gateway.

**Request Body (Payment Gateway):**
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
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "899.00",
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": { /* snapshot of all plan features */ }
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

**Response with Upgrade Available:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "subscription": { /* ... */ },
    "upgradeAvailable": {
      "id": 5,
      "name": "Cars Premium Plan",
      "slug": "cars-premium-v3",
      "finalPrice": "999.00",
      "version": 3
    }
  }
}
```

**Error Response:**
- `404` - No active subscription found

---

### 8. Get My Subscription History

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
      "planName": "Cars Premium Plan",
      "planCode": "cars-premium",
      "planVersion": 2,
      "status": "active",
      "startsAt": "2025-01-15T12:00:00.000Z",
      "endsAt": "2025-02-14T12:00:00.000Z",
      "finalPrice": "899.00",
      "amountPaid": "899.00"
    },
    {
      "id": 10,
      "planName": "Cars Basic Plan",
      "planCode": "cars-basic",
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

### 9. Get All My Subscriptions

Get all my subscriptions with optional status filter and pagination.

**Endpoint:** `GET /api/end-user/subscriptions`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status (`pending`, `active`, `expired`, `cancelled`, `suspended`)
- `categoryId` (optional) - Filter by category ID
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Example Request:**
```
GET /api/end-user/subscriptions?status=active&categoryId=1
GET /api/end-user/subscriptions?page=1&limit=5
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

### 10. Get My Subscription by ID

Get detailed information about a specific subscription (must be owned by user).

**Endpoint:** `GET /api/end-user/subscriptions/:id`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "startsAt": "2025-01-15T12:00:00.000Z",
    "endsAt": "2025-02-14T12:00:00.000Z",
    "activatedAt": "2025-01-15T12:00:00.000Z",
    "isTrial": false,
    "autoRenew": true,
    "planName": "Cars Premium Plan",
    "planCode": "cars-premium",
    "planVersion": 2,
    "basePrice": "1099.00",
    "discountAmount": "200.00",
    "finalPrice": "899.00",
    "currency": "INR",
    "durationDays": 30,
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": {
      "showPhoneNumber": true,
      "allowChat": true,
      "analyticsEnabled": true,
      "priorityModeration": true
    },
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
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
      "finalPrice": "899.00"
    },
    "previousSubscription": null,
    "notes": "Subscribed via online payment",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `403` - Unauthorized access (not user's subscription)
- `404` - Subscription not found

---

### 11. Cancel Subscription

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
    "id": 15,
    "status": "cancelled",
    "cancelledAt": "2025-01-20T10:00:00.000Z",
    "cancellationReason": "No longer needed",
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
  isTrial: boolean,
  autoRenew: boolean,
  planName: string,           // Snapshot
  planCode: string,           // Snapshot
  planVersion: number,        // Snapshot
  basePrice: decimal,         // Snapshot
  discountAmount: decimal,    // Snapshot
  finalPrice: decimal,        // Snapshot
  currency: string,           // Snapshot
  durationDays: number,       // Snapshot
  maxActiveListings: number,  // Snapshot
  maxFeaturedListings: number, // Snapshot
  features: json,             // Snapshot
  paymentMethod: string,      // "razorpay", "stripe", "manual", etc.
  transactionId: string,
  amountPaid: decimal,
  cancelledAt: timestamp,
  cancellationReason: string,
  previousSubscriptionId: number,
  notes: text,
  metadata: json,
  createdAt: timestamp,
  updatedAt: timestamp
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

---

## Notes

### Category-Based Subscriptions

1. **Category Support**: Users can have one active subscription per category
2. **Multiple Active Subscriptions**: Users can have active subscriptions across different categories simultaneously
3. **Category Filtering**: All endpoints support filtering by categoryId
4. **Free Plans**: Each category can have a default free plan for users without paid subscriptions

### User Subscriptions

5. **Immutable Snapshots**: User subscriptions store a complete snapshot of plan benefits at purchase time. Never query the plan table for user benefits.
6. **Category-Specific Active Subscriptions**: Users can only have one active subscription per category at a time.
7. **Upgrade Detection**: When fetching active subscription, the API checks if the plan is deprecated and suggests the replacement plan if available.
8. **Manual Assignment**: Super admins can manually assign subscriptions to users without payment (useful for complimentary plans, beta testers, etc.).
9. **Subscription Extension**: Super admins can extend subscription duration without creating a new subscription.
10. **Status Management**: Subscriptions can be in one of five states:
    - `pending` - Awaiting activation
    - `active` - Currently active
    - `expired` - Subscription period ended
    - `cancelled` - User or admin cancelled
    - `suspended` - Temporarily suspended
11. **Access Control**: End users can only view and manage their own subscriptions. Super admins have full access to all subscriptions.
12. **Manual Payment Flow**: Currently uses manual verification. Will be replaced with automated payment gateway integration.