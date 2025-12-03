# Manual Payment Verification API

**⚠️ TEMPORARY ENDPOINTS - Remove when payment gateway is implemented**

This document describes the temporary manual payment verification APIs used until payment gateway integration is complete.

---

## Table of Contents

1. [List Manual Subscriptions](#1-list-manual-subscriptions)
2. [Verify or Cancel Subscription](#2-verify-or-cancel-subscription)
3. [End User Subscription API](#3-end-user-subscription-api)
4. [QR Code Management](#4-qr-code-management)

---

## 1. List Manual Subscriptions

Get all subscriptions with filters for manual verification.

**Endpoint:** `GET /api/panel/manual-payments/subscriptions`

**Authentication:** Required (Super Admin only)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `pending`, `active`, `cancelled`, `expired`, `suspended` |
| `dateFrom` | string | No | Filter from date (ISO 8601 format: `2025-01-01`) |
| `dateTo` | string | No | Filter to date (ISO 8601 format: `2025-01-31`) |
| `search` | string | No | Search by customer name or mobile number |
| `userId` | number | No | Filter by specific user ID |
| `planId` | number | No | Filter by specific plan ID |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |

**Example Requests:**

```bash
# Get all pending subscriptions
GET /api/panel/manual-payments/subscriptions?status=pending

# Get pending subscriptions with date range
GET /api/panel/manual-payments/subscriptions?status=pending&dateFrom=2025-01-01&dateTo=2025-01-31

# Search by customer name or mobile
GET /api/panel/manual-payments/subscriptions?search=John
GET /api/panel/manual-payments/subscriptions?search=9876543210

# Combine filters
GET /api/panel/manual-payments/subscriptions?status=pending&search=John&page=1&limit=20

# Get all active subscriptions
GET /api/panel/manual-payments/subscriptions?status=active

# Get cancelled subscriptions
GET /api/panel/manual-payments/subscriptions?status=cancelled
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
      "status": "pending",
      "startsAt": null,
      "endsAt": null,
      "activatedAt": null,
      "planName": "Premium Plan",
      "planCode": "premium",
      "planVersion": 2,
      "finalPrice": "899.00",
      "amountPaid": "0.00",
      "paymentMethod": "manual",
      "transactionId": "T2025011512345678",
      "metadata": {},
      "notes": "Manual payment - Pending admin verification",
      "user": {
        "id": 42,
        "fullName": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com"
      },
      "plan": {
        "id": 4,
        "name": "Premium Plan",
        "slug": "premium-v2",
        "planCode": "premium",
        "version": 2
      },
      "transaction": {
        "id": 101,
        "transactionNumber": "TXN-2025-00001",
        "amount": "899.00",
        "currency": "INR",
        "paymentGateway": "manual",
        "gatewayPaymentId": "T2025011512345678",
        "manualPaymentMetadata": {
          "upiId": "user@paytm",
          "transactionId": "T2025011512345678",
          "paymentProof": {
            "url": "uploads/manual_payments/abc123.jpg",
            "storageType": "cloudinary",
            "mimeType": "image/jpeg",
            "size": 245678,
            "originalName": "payment_proof.jpg",
            "fullUrl": "https://res.cloudinary.com/yourcloud/image/upload/eclassify_app/uploads/manual_payments/abc123.jpg"
          },
          "submittedAt": "2025-01-15T12:00:00.000Z"
        },
        "status": "pending",
        "initiatedAt": "2025-01-15T12:00:00.000Z",
        "completedAt": null,
        "verifiedBy": null,
        "verifiedAt": null,
        "verificationNotes": null
      },
      "invoice": {
        "id": 201,
        "invoiceNumber": "INV-2025-00001",
        "totalAmount": "899.00",
        "amountPaid": "0.00",
        "amountDue": "899.00",
        "status": "pending",
        "invoiceDate": "2025-01-15T12:00:00.000Z",
        "paymentDate": null
      },
      "planDetails": {
        "id": 4,
        "name": "Premium Plan",
        "slug": "premium-v2",
        "planCode": "premium",
        "version": 2,
        "description": "Full-featured premium plan",
        "basePrice": "1099.00",
        "discountAmount": "200.00",
        "finalPrice": "899.00",
        "currency": "INR",
        "durationDays": 30,
        "features": {
          "showPhoneNumber": true,
          "allowChat": true,
          "analyticsEnabled": true
        }
      },
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    },
    {
      "id": 16,
      "userId": 43,
      "planId": 1,
      "status": "pending",
      "startsAt": null,
      "endsAt": null,
      "activatedAt": null,
      "planName": "Basic Plan",
      "planCode": "basic",
      "planVersion": 1,
      "finalPrice": "299.00",
      "amountPaid": "0.00",
      "paymentMethod": "manual",
      "transactionId": "T2025011612345679",
      "metadata": {
        "upiId": "customer@paytm",
        "paymentProof": null,
        "submittedAt": "2025-01-16T10:30:00.000Z"
      },
      "user": {
        "id": 43,
        "fullName": "Jane Smith",
        "mobile": "9876543211",
        "email": "jane@example.com"
      },
      "plan": {
        "id": 1,
        "name": "Basic Plan",
        "slug": "basic",
        "planCode": "basic",
        "version": 1
      },
      "createdAt": "2025-01-16T10:30:00.000Z",
      "updatedAt": "2025-01-16T10:30:00.000Z"
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

**Key Fields for Verification:**

- `transaction.manualPaymentMetadata.upiId` - UPI ID used for payment
- `transaction.gatewayPaymentId` - Transaction ID from payment
- `transaction.manualPaymentMetadata.paymentProof.fullUrl` - Full URL to payment proof (if uploaded)
- `transaction.manualPaymentMetadata.paymentProof.mimeType` - File type (image/jpeg, image/png, application/pdf)
- `transaction.amount` - Amount that should have been paid
- `invoice.totalAmount` - Invoice total amount
- `invoice.amountDue` - Amount still due
- `planDetails` - Complete plan information
- `user.mobile` - Customer mobile number
- `user.fullName` - Customer name
- `createdAt` - When subscription was submitted

**Payment Proof Details:**
- Stored in: `transaction.manualPaymentMetadata.paymentProof`
- Contains: `url` (relative path), `storageType`, `mimeType`, `size`, `originalName`, `fullUrl` (absolute URL)
- Cloudinary folder: `eclassify_app/uploads/manual_payments/`
- Local folder: `uploads/manual_payments/`
- Max size: 5MB
- Allowed formats: JPG, PNG, PDF

---

## 2. View Single Subscription

Get detailed information about a specific subscription for verification.

**Endpoint:** `GET /api/manual-payments/view/:id`

**Authentication:** Required (Super Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Subscription ID |

**Example Request:**
```bash
GET /api/manual-payments/view/15
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "pending",
    "startsAt": null,
    "endsAt": null,
    "activatedAt": null,
    "planName": "Premium Plan",
    "planCode": "premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "0.00",
    "paymentMethod": "manual",
    "transactionId": "T2025011512345678",
    "metadata": {},
    "notes": "Manual payment - Pending admin verification",
    "user": {
      "id": 42,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "plan": {
      "id": 4,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "planCode": "premium",
      "version": 2
    },
    "transaction": {
      "id": 101,
      "transactionNumber": "TXN-2025-00001",
      "amount": "899.00",
      "currency": "INR",
      "paymentGateway": "manual",
      "gatewayPaymentId": "T2025011512345678",
      "manualPaymentMetadata": {
        "upiId": "user@paytm",
        "transactionId": "T2025011512345678",
        "paymentProof": {
          "url": "uploads/manual_payments/abc123.jpg",
          "storageType": "cloudinary",
          "mimeType": "image/jpeg",
          "size": 245678,
          "originalName": "payment_proof.jpg",
          "fullUrl": "https://res.cloudinary.com/yourcloud/image/upload/eclassify_app/uploads/manual_payments/abc123.jpg"
        },
        "submittedAt": "2025-01-15T12:00:00.000Z"
      },
      "status": "pending",
      "initiatedAt": "2025-01-15T12:00:00.000Z",
      "completedAt": null,
      "verifiedBy": null,
      "verifiedAt": null,
      "verificationNotes": null
    },
    "invoice": {
      "id": 201,
      "invoiceNumber": "INV-2025-00001",
      "totalAmount": "899.00",
      "amountPaid": "0.00",
      "amountDue": "899.00",
      "status": "pending",
      "invoiceDate": "2025-01-15T12:00:00.000Z",
      "paymentDate": null
    },
    "planDetails": {
      "id": 4,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "planCode": "premium",
      "version": 2,
      "description": "Full-featured premium plan",
      "basePrice": "1099.00",
      "discountAmount": "200.00",
      "finalPrice": "899.00",
      "currency": "INR",
      "durationDays": 30,
      "features": {
        "showPhoneNumber": true,
        "allowChat": true,
        "analyticsEnabled": true
      }
    },
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Response:**
- `404` - Subscription not found

---

## 3. Verify or Cancel Subscription

Approve or reject a pending subscription after manual payment verification.

**Endpoint:** `POST /api/panel/manual-payments/verify/:id`

**Authentication:** Required (Super Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Subscription ID to verify |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approved` | boolean | Yes | `true` to approve, `false` to reject |
| `notes` | string | No | Verification notes (reason for approval/rejection) |

### 2.1 Approve Payment

**Request:**

```json
{
  "approved": true,
  "notes": "Payment verified via bank statement. Transaction ID matches."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment verified and subscription activated successfully",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "active",
    "startsAt": "2025-01-20T10:00:00.000Z",
    "endsAt": "2025-02-19T10:00:00.000Z",
    "activatedAt": "2025-01-20T10:00:00.000Z",
    "planName": "Premium Plan",
    "planCode": "premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "899.00",
    "paymentMethod": "manual",
    "transactionId": "T2025011512345678",
    "notes": "Payment verified via bank statement. Transaction ID matches.",
    "user": {
      "id": 42,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "plan": {
      "id": 4,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "planCode": "premium",
      "version": 2
    },
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**What Happens on Approval:**

1. **Subscription Table:**
   - `status`: `pending` → `active`
   - `startsAt`: `null` → current timestamp
   - `endsAt`: `null` → calculated (startsAt + plan duration)
   - `activatedAt`: `null` → current timestamp (same as startsAt)
   - `amountPaid`: `0` → plan's finalPrice
   - `notes`: updated with verification notes

2. **Invoice Table:**
   - `status`: `pending` → `paid`
   - `amountPaid`: `0` → plan's finalPrice
   - `amountDue`: plan's finalPrice → `0`
   - `paymentDate`: `null` → current timestamp
   - `notes`: updated with verification notes

3. **Transaction Table:**
   - `status`: `pending` → `completed`
   - `completedAt`: `null` → current timestamp
   - `verifiedBy`: admin user ID
   - `verifiedAt`: current timestamp
   - `verificationNotes`: admin's notes

### 2.2 Reject Payment

**Request:**

```json
{
  "approved": false,
  "notes": "Invalid transaction ID. Payment not found in bank statement."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment rejected and subscription cancelled",
  "data": {
    "id": 15,
    "userId": 42,
    "planId": 4,
    "status": "cancelled",
    "startsAt": null,
    "endsAt": null,
    "activatedAt": null,
    "cancelledAt": "2025-01-20T10:00:00.000Z",
    "cancellationReason": "Invalid transaction ID. Payment not found in bank statement.",
    "planName": "Premium Plan",
    "planCode": "premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "0.00",
    "paymentMethod": "manual",
    "transactionId": "T2025011512345678",
    "notes": "Invalid transaction ID. Payment not found in bank statement.",
    "user": {
      "id": 42,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "plan": {
      "id": 4,
      "name": "Premium Plan",
      "slug": "premium-v2",
      "planCode": "premium",
      "version": 2
    },
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**What Happens on Rejection:**

1. **Subscription Table:**
   - `status`: `pending` → `cancelled`
   - `cancelledAt`: current timestamp
   - `cancellationReason`: admin's notes
   - `notes`: updated with verification notes

2. **Invoice Table:**
   - `status`: `pending` → `cancelled`
   - `notes`: updated with verification notes

3. **Transaction Table:**
   - `status`: `pending` → `failed`
   - `failureReason`: admin's notes
   - `verifiedBy`: admin user ID
   - `verifiedAt`: current timestamp
   - `verificationNotes`: admin's notes

**Error Responses:**

```json
// 400 - Missing required field
{
  "success": false,
  "message": "Approved status (true/false) is required"
}

// 400 - Invalid subscription status
{
  "success": false,
  "message": "Only pending subscriptions can be verified"
}

// 404 - Subscription not found
{
  "success": false,
  "message": "Subscription not found"
}
```

---

## 3. End User Subscription API

### Current Implementation (Manual Payment)

**Endpoint:** `POST /api/manual-payments/create`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | number | Yes | Plan ID to subscribe to |
| `upiId` | string | Yes | UPI ID used for payment |
| `transactionId` | string | Yes | Transaction ID from payment |
| `paymentProof` | file | No | Payment proof image/PDF (max 5MB, JPG/PNG/PDF) |
| `customerName` | string | No | Customer name (defaults to user's fullName) |
| `customerMobile` | string | No | Customer mobile (defaults to user's mobile) |

**Example Request (using FormData):**

```javascript
const formData = new FormData();
formData.append('planId', '4');
formData.append('upiId', 'user@paytm');
formData.append('transactionId', 'T2025011512345678');
formData.append('paymentProof', fileInput.files[0]); // File object
formData.append('customerName', 'John Doe');
formData.append('customerMobile', '9876543210');

fetch('/api/manual-payments/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/manual-payments/create \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "planId=4" \
  -F "upiId=user@paytm" \
  -F "transactionId=T2025011512345678" \
  -F "paymentProof=@/path/to/proof.jpg" \
  -F "customerName=John Doe" \
  -F "customerMobile=9876543210"
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
    "startsAt": null,
    "endsAt": null,
    "activatedAt": null,
    "planName": "Premium Plan",
    "planCode": "premium",
    "planVersion": 2,
    "finalPrice": "899.00",
    "amountPaid": "0.00",
    "maxActiveListings": 10,
    "maxFeaturedListings": 5,
    "features": {
      "showPhoneNumber": true,
      "allowChat": true,
      "analyticsEnabled": true
    },
    "paymentMethod": "manual",
    "transactionId": "T2025011512345678",
    "metadata": {
      "upiId": "user@paytm",
      "paymentProof": {
        "url": "uploads/manual_payments/abc123.jpg",
        "storageType": "cloudinary",
        "mimeType": "image/jpeg",
        "size": 245678,
        "originalName": "payment_proof.jpg"
      },
      "submittedAt": "2025-01-15T12:00:00.000Z"
    },
    "notes": "Manual payment - Pending admin verification",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Missing required fields
{
  "success": false,
  "message": "UPI ID and Transaction ID are required"
}

// 400 - User already has active subscription
{
  "success": false,
  "message": "User already has an active subscription"
}

// 404 - Plan not found
{
  "success": false,
  "message": "Subscription plan not found"
}
```

### ⚠️ Important Notes

**Does this API require changes when payment gateway is integrated?**

**Answer: YES, but minimal changes required.**

**Current Manual Flow:**
```javascript
POST /api/end-user/subscriptions
{
  "planId": 4,
  "upiId": "user@paytm",
  "transactionId": "T2025011512345678",
  "paymentProof": "https://example.com/proof.jpg"
}
```

**Future Payment Gateway Flow:**
```javascript
POST /api/end-user/subscriptions
{
  "planId": 4,
  "paymentData": {
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
    "amountPaid": 899.00,
    "orderId": "order_123",
    "signature": "signature_xyz"
  }
}
```

**What Changes:**
1. Request body structure changes from flat fields to nested `paymentData` object
2. Different fields required (payment gateway specific)
3. Response will have `status: "active"` instead of `status: "pending"`
4. Subscription activated immediately (no admin verification needed)

**How to Switch:**
1. In `src/controllers/end-user/subscriptionController.js`:
   - Comment out lines 25-50 (manual payment section)
   - Uncomment lines 52-75 (payment gateway section)

2. In `src/services/subscriptionService.js`:
   - Comment out lines 150-250 (manual payment section)
   - Uncomment lines 252-380 (payment gateway section)
   - Implement `_verifyPaymentWithGateway()` method

3. Frontend changes:
   - Update form to collect payment gateway data instead of UPI/Transaction ID
   - Integrate payment gateway SDK (Razorpay/Stripe)
   - Handle immediate activation (no pending state)

**Recommendation:** Keep the same endpoint URL (`POST /api/end-user/subscriptions`) but change the request body structure. This way, you only need to update the frontend form, not the API endpoint itself.

---

## Verification Workflow

### Step-by-Step Process

1. **User Submits Subscription**
   - User fills form with UPI ID, Transaction ID, optional proof
   - POST request to `/api/end-user/subscriptions`
   - Subscription created with `status: pending`

2. **Admin Views Pending Subscriptions**
   - Admin opens admin panel
   - GET request to `/api/panel/subscriptions?status=pending`
   - List shows all pending subscriptions with customer details

3. **Admin Verifies Payment**
   - Admin checks bank statement/UPI app
   - Verifies transaction ID matches
   - Verifies amount matches plan price

4. **Admin Approves/Rejects**
   - POST request to `/api/panel/subscriptions/:id/verify-payment`
   - If approved: subscription activated, user can use benefits
   - If rejected: subscription cancelled, user notified

5. **User Checks Status**
   - GET request to `/api/end-user/subscriptions/active`
   - If approved: returns active subscription
   - If pending: returns 404
   - If rejected: subscription appears in history as cancelled

---

## Testing Examples

### Test Scenario 1: Approve Payment

```bash
# 1. User submits subscription with payment proof
curl -X POST http://localhost:5000/api/manual-payments/create \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "planId=4" \
  -F "upiId=test@paytm" \
  -F "transactionId=TEST123456" \
  -F "paymentProof=@/path/to/proof.jpg"

# 2. Admin lists pending subscriptions
curl -X GET "http://localhost:5000/api/manual-payments/list?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Admin views single subscription details
curl -X GET "http://localhost:5000/api/manual-payments/view/15" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 4. Admin approves payment
curl -X POST http://localhost:5000/api/manual-payments/verify/15 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Payment verified"
  }'

# 5. User checks active subscription
curl -X GET http://localhost:5000/api/end-user/subscriptions/active \
  -H "Authorization: Bearer USER_TOKEN"
```

### Test Scenario 2: Reject Payment

```bash
# 1. User submits subscription (same as above)

# 2. Admin rejects payment
curl -X POST http://localhost:5000/api/panel/manual-payments/verify/15 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "notes": "Invalid transaction ID"
  }'

# 3. User checks active subscription (returns 404)
curl -X GET http://localhost:5000/api/end-user/subscriptions/active \
  -H "Authorization: Bearer USER_TOKEN"
```

### Test Scenario 3: Search and Filter

```bash
# Search by customer name
curl -X GET "http://localhost:5000/api/panel/manual-payments/subscriptions?status=pending&search=John" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Search by mobile number
curl -X GET "http://localhost:5000/api/panel/manual-payments/subscriptions?status=pending&search=9876543210" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Filter by date range
curl -X GET "http://localhost:5000/api/panel/manual-payments/subscriptions?status=pending&dateFrom=2025-01-01&dateTo=2025-01-31" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 4. QR Code Management

### 4.1 Upload QR Code (Super Admin)

Upload or update the QR code image for manual payments.

**Endpoint:** `POST /api/panel/manual-payments/qr-code`

**Authentication:** Required (Super Admin only)

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qrCode` | file | Yes | QR code image (max 2MB, JPG/PNG only) |

**Example Request:**

```javascript
const formData = new FormData();
formData.append('qrCode', fileInput.files[0]); // File object

fetch('/api/panel/manual-payments/qr-code', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
});
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/panel/manual-payments/qr-code \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "qrCode=@/path/to/qr-code.png"
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "QR code uploaded successfully",
  "data": {
    "id": 1,
    "identifierSlug": "manual-payment-qr",
    "slug": "manual-payment-qr-a3b5",
    "caption": "Manual Payment QR Code",
    "subCaption": "Scan to make payment",
    "description": "QR code for manual payment verification",
    "mediaType": "image",
    "mediaUrl": "http://localhost:5000/uploads/manual-payment-qr/my-qr.jpg",
    "thumbnailUrl": "http://localhost:5000/uploads/manual-payment-qr/my-qr.jpg",
    "mimeType": "image/png",
    "thumbnailMimeType": "image/png",
    "displayOrder": 0,
    "isPrimary": true,
    "storageType": "local",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**Storage Details:**
- **Cloudinary path:** `eclassify_app/uploads/manual-payment-qr/my-qr.jpg`
- **Database path:** `uploads/manual-payment-qr/my-qr.jpg`
- **Local path:** `uploads/manual-payment-qr/my-qr.jpg`
- **Max size:** 2MB
- **Allowed formats:** JPG, PNG

**Behavior:**
- If QR code already exists, old file is deleted from storage and database record is updated
- Only one QR code record exists at a time (identifier_slug: 'manual-payment-qr')
- Full URL is automatically generated based on storage type
- Returns "QR code updated successfully" if updating, "QR code uploaded successfully" if creating new

**Error Responses:**

```json
// 400 - No file uploaded
{
  "success": false,
  "message": "QR code image is required"
}

// 400 - Invalid file type
{
  "success": false,
  "message": "Invalid file type. Only JPG and PNG are allowed for QR codes."
}

// 400 - File too large
{
  "success": false,
  "message": "File too large"
}
```

---

### 4.2 Get QR Code (Public)

Retrieve the current QR code for manual payments.

**Endpoint:** `GET /api/public/manual-payments/qr-code`

**Authentication:** Not required (Public endpoint)

**Example Request:**

```bash
curl -X GET http://localhost:5000/api/public/manual-payments/qr-code
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "QR code retrieved successfully",
  "data": {
    "id": 1,
    "identifierSlug": "manual-payment-qr",
    "slug": "manual-payment-qr-a3b5",
    "caption": "Manual Payment QR Code",
    "subCaption": "Scan to make payment",
    "description": "QR code for manual payment verification",
    "mediaType": "image",
    "mediaUrl": "http://localhost:5000/uploads/manual-payment-qr/my-qr.jpg",
    "thumbnailUrl": "http://localhost:5000/uploads/manual-payment-qr/my-qr.jpg",
    "mimeType": "image/png",
    "thumbnailMimeType": "image/png",
    "displayOrder": 0,
    "isPrimary": true,
    "storageType": "local",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**Response when no QR code exists:**

```json
{
  "success": true,
  "message": "No QR code available",
  "data": null
}
```

**Frontend Usage:**

```javascript
// Fetch QR code
const response = await fetch('/api/public/manual-payments/qr-code');
const result = await response.json();

if (result.data) {
  // Display QR code
  document.getElementById('qr-image').src = result.data.mediaUrl;
  document.getElementById('qr-caption').textContent = result.data.caption;
} else {
  // Show message: No QR code available
  document.getElementById('qr-container').innerHTML = '<p>QR code not available</p>';
}
```

---

## Summary

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/manual-payments/create` | Create manual payment subscription | Authenticated User |
| GET | `/api/panel/manual-payments/list` | List manual payment subscriptions | Super Admin |
| GET | `/api/panel/manual-payments/view/:id` | View manual payment subscription | Super Admin |
| POST | `/api/panel/manual-payments/verify/:id` | Verify or cancel manual payment | Super Admin |
| POST | `/api/panel/manual-payments/qr-code` | Upload QR code for manual payments | Super Admin |
| GET | `/api/public/manual-payments/qr-code` | Get QR code for manual payments | Public |

### Status Flow

```
User Submits → PENDING → Admin Approves → ACTIVE
                      ↘ Admin Rejects → CANCELLED
```

### Key Points

1. ✅ Same endpoint for end users (no changes needed now)
2. ✅ Easy to switch to payment gateway later
3. ✅ Complete audit trail maintained
4. ✅ Search by name or mobile number
5. ✅ Filter by status, date range, user, plan
6. ✅ Atomic updates (all tables updated together)
7. ⚠️ Remove these endpoints when payment gateway is implemented
