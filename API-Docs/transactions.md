# Transaction API Documentation

## Overview
Transaction management endpoints for end-users and admin panel. End-users can view and manage their own transactions, while admins can manage all transactions including verification.

## Base URLs
- End-User: `/api/end-user/transactions`
- Admin Panel: `/api/panel/transactions`

---

## End-User Endpoints

### 1. List User Transactions
**GET** `/api/end-user/transactions`

List all transactions for the authenticated user with optional filters.

**Authentication:** Required (JWT)

**Query Parameters:**
- `status` (optional): Filter by transaction status
  - Values: `initiated`, `pending`, `processing`, `completed`, `failed`, `refunded`, `partially_refunded`, `cancelled`, `expired`
- `transactionType` (optional): Filter by transaction type
  - Values: `payment`, `refund`, `adjustment`
- `startDate` (optional): Filter transactions from this date (ISO 8601)
- `endDate` (optional): Filter transactions until this date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "transactionNumber": "TXN-2024-001",
      "transactionType": "payment",
      "transactionContext": "new_subscription",
      "transactionMethod": "manual",
      "invoiceId": 1,
      "subscriptionId": 45,
      "userId": 123,
      "subscriptionPlanId": 2,
      "amount": 990.00,
      "currency": "INR",
      "hasProration": false,
      "prorationAmount": 0.00,
      "paymentGateway": "manual",
      "status": "completed",
      "initiatedAt": "2024-01-15T10:00:00.000Z",
      "completedAt": "2024-01-15T11:00:00.000Z",
      "invoice": {
        "id": 1,
        "invoiceNumber": "INV-2024-001",
        "totalAmount": 990.00
      },
      "user": {
        "id": 123,
        "email": "john@example.com",
        "mobile": "9876543210"
      },
      "plan": {
        "id": 2,
        "name": "Premium Plan",
        "code": "PREMIUM"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 2. Get Transaction Details
**GET** `/api/end-user/transactions/:id`

Get detailed information about a specific transaction.

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 1,
    "transactionNumber": "TXN-2024-001",
    "transactionType": "payment",
    "transactionContext": "new_subscription",
    "transactionMethod": "manual",
    "invoiceId": 1,
    "subscriptionId": 45,
    "userId": 123,
    "subscriptionPlanId": 2,
    "amount": 990.00,
    "currency": "INR",
    "hasProration": false,
    "prorationAmount": 0.00,
    "paymentGateway": "manual",
    "gatewayOrderId": null,
    "gatewayPaymentId": null,
    "gatewayResponse": null,
    "manualPaymentMetadata": {
      "referenceNumber": "REF123",
      "paymentMode": "bank_transfer"
    },
    "status": "completed",
    "failureReason": null,
    "verifiedBy": 5,
    "verifiedAt": "2024-01-15T11:00:00.000Z",
    "verificationNotes": "Payment verified",
    "ipAddress": "192.168.1.1",
    "initiatedAt": "2024-01-15T10:00:00.000Z",
    "completedAt": "2024-01-15T11:00:00.000Z",
    "expiresAt": null,
    "metadata": {},
    "invoice": {
      "id": 1,
      "invoiceNumber": "INV-2024-001",
      "totalAmount": 990.00,
      "status": "paid"
    },
    "user": {
      "id": 123,
      "email": "john@example.com",
      "mobile": "9876543210"
    },
    "subscription": {
      "id": 45,
      "status": "active"
    },
    "plan": {
      "id": 2,
      "name": "Premium Plan",
      "code": "PREMIUM"
    },
    "verifier": {
      "id": 5,
      "email": "admin@example.com"
    }
  }
}
```

### 3. Create Transaction
**POST** `/api/end-user/transactions`

Create a new transaction (typically for manual payments).

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "transactionNumber": "TXN-2024-002",
  "invoiceId": 2,
  "subscriptionId": 45,
  "subscriptionPlanId": 2,
  "amount": 1100.00,
  "transactionType": "payment",
  "transactionContext": "renewal",
  "transactionMethod": "manual",
  "paymentGateway": "manual",
  "currency": "INR",
  "manualPaymentMetadata": {
    "referenceNumber": "REF456",
    "paymentMode": "upi",
    "upiId": "user@paytm"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": 2,
    "transactionNumber": "TXN-2024-002",
    // ... full transaction details
  }
}
```

### 4. Update Transaction
**PUT** `/api/end-user/transactions/:id`

Update transaction details (restricted for completed transactions).

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "manualPaymentMetadata": {
    "referenceNumber": "REF456-UPDATED",
    "paymentMode": "upi",
    "upiId": "user@paytm",
    "notes": "Updated payment reference"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    // Updated transaction details
  }
}
```

---

## Admin Panel Endpoints

### 1. List All Transactions
**GET** `/api/panel/transactions`

List all transactions with optional filters (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by transaction status
- `transactionType` (optional): Filter by transaction type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter until date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** Same as end-user list endpoint

### 2. Get Transaction Details
**GET** `/api/panel/transactions/:id`

Get any transaction details (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Response:** Same as end-user get endpoint

### 3. Create Transaction
**POST** `/api/panel/transactions`

Create transaction for any user (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "userId": 123,
  "transactionNumber": "TXN-2024-003",
  "invoiceId": 3,
  "subscriptionId": 46,
  "subscriptionPlanId": 2,
  "amount": 990.00,
  "transactionType": "payment",
  "transactionContext": "admin_assigned",
  "transactionMethod": "manual",
  "paymentGateway": "manual",
  "currency": "INR",
  "status": "completed",
  "manualPaymentMetadata": {
    "referenceNumber": "ADMIN-REF-001",
    "paymentMode": "cash",
    "notes": "Cash payment received at office"
  }
}
```

**Response:** Same as end-user create endpoint

### 4. Update Transaction Status
**PATCH** `/api/panel/transactions/status/:id`

Update transaction status with additional data.

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "status": "completed",
  "completedAt": "2024-01-15T11:00:00.000Z",
  "failureReason": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction status updated successfully",
  "data": {
    // Updated transaction details
  }
}
```

### 5. Verify Transaction
**PATCH** `/api/panel/transactions/verify/:id`

Verify a manual payment transaction (sets status to completed).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "notes": "Payment verified against bank statement"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": {
    "id": 1,
    "status": "completed",
    "verifiedBy": 5,
    "verifiedAt": "2024-01-15T11:00:00.000Z",
    "verificationNotes": "Payment verified against bank statement",
    // ... full transaction details
  }
}
```

### 6. Update Transaction
**PUT** `/api/panel/transactions/:id`

Update any transaction field (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "status": "failed",
  "failureReason": "Insufficient funds",
  "failureCode": "INSUFFICIENT_FUNDS",
  "metadata": {
    "adminNote": "Customer notified"
  }
}
```

**Response:** Same as end-user update endpoint

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Transaction number already exists",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only view your own transactions",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Transaction not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve transactions",
  "data": null
}
```

---

## Transaction Status Flow

```
initiated → pending → processing → completed
                              ↓
                           failed
                              ↓
                         cancelled

completed → refunded/partially_refunded

initiated → expired (if not completed within time)
```

## Transaction Types

- **payment**: Regular payment transaction
- **refund**: Refund transaction
- **adjustment**: Manual adjustment by admin

## Transaction Context

- **new_subscription**: First-time subscription purchase
- **renewal**: Subscription renewal
- **upgrade**: Plan upgrade
- **downgrade**: Plan downgrade
- **refund**: Refund context
- **adjustment**: Manual adjustment
- **admin_assigned**: Admin-created transaction

## Payment Gateways

- **manual**: Manual payment (bank transfer, cash, etc.)
- **razorpay**: Razorpay gateway
- **stripe**: Stripe gateway
- **paytm**: Paytm gateway
- **phonepe**: PhonePe gateway
- **cashfree**: Cashfree gateway
- **payU**: PayU gateway
- **jiopay**: JioPay gateway
- **instamojo**: Instamojo gateway
- **airpay**: Airpay gateway

## Notes

- End-users can only access their own transactions
- Admins (super_admin, admin, accountant) can access all transactions
- Transaction numbers must be unique
- Completed/refunded transactions have restrictions on amount modifications
- Manual payment verification is done by admins using the verify endpoint
- All dates are in ISO 8601 format
- Currency defaults to INR
