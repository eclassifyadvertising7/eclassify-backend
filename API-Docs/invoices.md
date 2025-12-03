# Invoice API Documentation

## Overview
Invoice management endpoints for end-users and admin panel. End-users can view and manage their own invoices, while admins can manage all invoices.

## Base URLs
- End-User: `/api/end-user/invoices`
- Admin Panel: `/api/panel/invoices`

---

## End-User Endpoints

### 1. List User Invoices
**GET** `/api/end-user/invoices`

List all invoices for the authenticated user with optional filters.

**Authentication:** Required (JWT)

**Query Parameters:**
- `status` (optional): Filter by invoice status
  - Values: `draft`, `issued`, `pending`, `paid`, `partially_paid`, `overdue`, `cancelled`, `refunded`, `void`
- `startDate` (optional): Filter invoices from this date (ISO 8601)
- `endDate` (optional): Filter invoices until this date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "id": 1,
      "invoiceNumber": "INV-2024-001",
      "invoiceType": "new_subscription",
      "userId": 123,
      "subscriptionId": 45,
      "invoiceDate": "2024-01-15T10:00:00.000Z",
      "customerName": "John Doe",
      "customerMobile": "9876543210",
      "planName": "Premium Plan",
      "planCode": "PREMIUM",
      "subtotal": 1000.00,
      "discountAmount": 100.00,
      "taxAmount": 90.00,
      "totalAmount": 990.00,
      "amountPaid": 990.00,
      "amountDue": 0.00,
      "currency": "INR",
      "status": "paid",
      "paymentMethod": "manual",
      "paymentDate": "2024-01-15T11:00:00.000Z",
      "user": {
        "id": 123,
        "email": "john@example.com",
        "mobile": "9876543210"
      },
      "subscription": {
        "id": 45,
        "status": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Get Invoice Details
**GET** `/api/end-user/invoices/:id`

Get detailed information about a specific invoice.

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Invoice retrieved successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "INV-2024-001",
    "invoiceType": "new_subscription",
    "userId": 123,
    "subscriptionId": 45,
    "invoiceDate": "2024-01-15T10:00:00.000Z",
    "customerName": "John Doe",
    "customerMobile": "9876543210",
    "customerMetadata": {},
    "planName": "Premium Plan",
    "planCode": "PREMIUM",
    "planVersion": 1,
    "planSnapshot": {},
    "subtotal": 1000.00,
    "discountAmount": 100.00,
    "discountPercentage": 10.00,
    "discountCode": "WELCOME10",
    "prorationCredit": 0.00,
    "adjustedSubtotal": 900.00,
    "taxAmount": 90.00,
    "taxPercentage": 10.00,
    "totalAmount": 990.00,
    "amountPaid": 990.00,
    "amountDue": 0.00,
    "currency": "INR",
    "status": "paid",
    "paymentMethod": "manual",
    "paymentDate": "2024-01-15T11:00:00.000Z",
    "notes": "Admin notes",
    "customerNotes": "Customer notes",
    "metadata": {},
    "user": {
      "id": 123,
      "email": "john@example.com",
      "mobile": "9876543210"
    },
    "subscription": {
      "id": 45,
      "status": "active",
      "startDate": "2024-01-15",
      "endDate": "2024-02-15"
    },
    "transactions": [
      {
        "id": 1,
        "transactionNumber": "TXN-2024-001",
        "amount": 990.00,
        "status": "completed",
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

### 3. Download Invoice
**GET** `/api/end-user/invoices/:id/download`

Download invoice as PDF (currently returns invoice data for PDF generation).

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Invoice ready for download",
  "data": {
    // Full invoice details
  }
}
```

### 4. Create Invoice
**POST** `/api/end-user/invoices`

Create a new invoice (typically used for manual invoicing).

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "invoiceNumber": "INV-2024-002",
  "subscriptionId": 45,
  "invoiceType": "new_subscription",
  "customerName": "John Doe",
  "customerMobile": "9876543210",
  "planName": "Premium Plan",
  "planCode": "PREMIUM",
  "planVersion": 1,
  "subtotal": 1000.00,
  "discountAmount": 0.00,
  "taxAmount": 100.00,
  "taxPercentage": 10.00,
  "totalAmount": 1100.00,
  "amountDue": 1100.00,
  "currency": "INR",
  "status": "issued"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": 2,
    "invoiceNumber": "INV-2024-002",
    // ... full invoice details
  }
}
```

### 5. Update Invoice
**PUT** `/api/end-user/invoices/:id`

Update invoice details (restricted for paid invoices).

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "notes": "Updated notes",
  "customerNotes": "Customer updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    // Updated invoice details
  }
}
```

---

## Admin Panel Endpoints

### 1. List All Invoices
**GET** `/api/panel/invoices`

List all invoices with optional filters (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by invoice status
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter until date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** Same as end-user list endpoint

### 2. Get Invoice Details
**GET** `/api/panel/invoices/:id`

Get any invoice details (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Response:** Same as end-user get endpoint

### 3. Download Invoice
**GET** `/api/panel/invoices/:id/download`

Download any invoice as PDF.

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Response:** Same as end-user download endpoint

### 4. Create Invoice
**POST** `/api/panel/invoices`

Create invoice for any user (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "userId": 123,
  "subscriptionId": 45,
  "invoiceNumber": "INV-2024-003",
  "invoiceType": "admin_assigned",
  "customerName": "John Doe",
  "customerMobile": "9876543210",
  "planName": "Premium Plan",
  "planCode": "PREMIUM",
  "planVersion": 1,
  "subtotal": 1000.00,
  "discountAmount": 100.00,
  "taxAmount": 90.00,
  "taxPercentage": 10.00,
  "totalAmount": 990.00,
  "amountDue": 990.00,
  "currency": "INR",
  "status": "issued"
}
```

**Response:** Same as end-user create endpoint

### 5. Update Invoice Status
**PATCH** `/api/panel/invoices/status/:id`

Update invoice status.

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice status updated successfully",
  "data": {
    // Updated invoice details
  }
}
```

### 6. Update Invoice
**PUT** `/api/panel/invoices/:id`

Update any invoice field (admin access).

**Authentication:** Required (JWT + super_admin/admin/accountant role)

**Request Body:**
```json
{
  "status": "paid",
  "amountPaid": 990.00,
  "amountDue": 0.00,
  "paymentMethod": "manual",
  "paymentDate": "2024-01-15T11:00:00.000Z",
  "notes": "Payment verified by admin"
}
```

**Response:** Same as end-user update endpoint

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invoice number already exists",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only view your own invoices",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Invoice not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve invoices",
  "data": null
}
```

---

## Invoice Status Flow

```
draft → issued → pending → paid
                        ↓
                  partially_paid → paid
                        ↓
                    overdue
                        ↓
                  cancelled/refunded/void
```

## Notes

- End-users can only access their own invoices
- Admins (super_admin, admin, accountant) can access all invoices
- Invoice numbers must be unique
- Paid invoices have restrictions on amount modifications
- All dates are in ISO 8601 format
- Currency defaults to INR
