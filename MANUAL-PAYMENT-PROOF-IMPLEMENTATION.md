# Manual Payment Proof Upload Implementation

## Overview

This document describes the payment proof upload functionality for manual payment verification. Users can upload payment proof (image/PDF) when submitting manual payment subscriptions.

---

## Implementation Details

### 1. File Upload Configuration

**File:** `src/config/temp/manualPaymentUploadConfig.js`

**Features:**
- Supports both Cloudinary and local storage
- Max file size: 5MB
- Allowed formats: JPG, PNG, PDF
- Auto-generates unique filenames using `generateFileName()`
- Stores relative paths in database

**Storage Paths:**
- **Cloudinary:** `eclassify_app/uploads/manual_payments/`
- **Local:** `uploads/manual_payments/`
- **Database:** `uploads/manual_payments/filename.jpg` (relative path)

### 2. Data Storage

**Table:** `transactions`
**Column:** `manual_payment_metadata` (JSON)

**Structure:**
```json
{
  "upiId": "user@paytm",
  "transactionId": "T123456",
  "submittedAt": "2025-01-15T12:00:00.000Z",
  "paymentProof": {
    "url": "uploads/manual_payments/abc123.jpg",
    "storageType": "cloudinary",
    "mimeType": "image/jpeg",
    "size": 245678,
    "originalName": "payment_proof.jpg"
  }
}
```

### 3. URL Transformation

**Helper:** `src/utils/temp/paymentProofHelper.js`

**Functions:**
- `getPaymentProofUrl()` - Converts relative path to full URL
- `transformPaymentProofMetadata()` - Adds `fullUrl` to metadata

**Output:**
```json
{
  "paymentProof": {
    "url": "uploads/manual_payments/abc123.jpg",
    "storageType": "cloudinary",
    "mimeType": "image/jpeg",
    "size": 245678,
    "originalName": "payment_proof.jpg",
    "fullUrl": "https://res.cloudinary.com/yourcloud/image/upload/eclassify_app/uploads/manual_payments/abc123.jpg"
  }
}
```

---

## API Endpoints

### End User: Submit Subscription with Proof

**Endpoint:** `POST /api/manual-payments/subscribe`

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:5000/api/manual-payments/subscribe \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "planId=4" \
  -F "upiId=user@paytm" \
  -F "transactionId=T123456" \
  -F "paymentProof=@/path/to/proof.jpg" \
  -F "customerName=John Doe" \
  -F "customerMobile=9876543210"
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription request submitted successfully. Pending admin verification.",
  "data": {
    "id": 15,
    "status": "pending",
    "planName": "Premium Plan",
    "finalPrice": "899.00"
  }
}
```

### Admin: List Subscriptions with Proof

**Endpoint:** `GET /api/manual-payments/subscriptions?status=pending`

**Response Includes:**
- Subscription details
- User details
- **Transaction details** (with payment proof)
- **Invoice details**
- **Plan details** (complete plan information)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "status": "pending",
      "user": {
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "transaction": {
        "transactionNumber": "TXN-2025-00001",
        "amount": "899.00",
        "manualPaymentMetadata": {
          "upiId": "user@paytm",
          "transactionId": "T123456",
          "paymentProof": {
            "url": "uploads/manual_payments/abc123.jpg",
            "fullUrl": "https://res.cloudinary.com/.../abc123.jpg",
            "mimeType": "image/jpeg",
            "size": 245678
          }
        }
      },
      "invoice": {
        "invoiceNumber": "INV-2025-00001",
        "totalAmount": "899.00",
        "amountDue": "899.00"
      },
      "planDetails": {
        "name": "Premium Plan",
        "finalPrice": "899.00",
        "features": {...}
      }
    }
  ]
}
```

---

## Frontend Integration

### React Example

```javascript
const handleSubscribe = async (planId, upiId, transactionId, proofFile) => {
  const formData = new FormData();
  formData.append('planId', planId);
  formData.append('upiId', upiId);
  formData.append('transactionId', transactionId);
  
  if (proofFile) {
    formData.append('paymentProof', proofFile);
  }

  const response = await fetch('/api/manual-payments/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result;
};
```

### Display Payment Proof (Admin)

```javascript
const PaymentProofDisplay = ({ transaction }) => {
  const proof = transaction?.manualPaymentMetadata?.paymentProof;
  
  if (!proof) {
    return <span>No proof uploaded</span>;
  }

  if (proof.mimeType === 'application/pdf') {
    return (
      <a href={proof.fullUrl} target="_blank" rel="noopener noreferrer">
        View PDF Proof
      </a>
    );
  }

  return (
    <img 
      src={proof.fullUrl} 
      alt="Payment Proof" 
      style={{ maxWidth: '300px' }}
    />
  );
};
```

---

## Database Fields

### Required Fields (No Issues)

All required fields are properly populated:

**user_subscriptions:**
- ✅ All required fields populated from plan snapshot
- ✅ `status` = 'pending'
- ✅ `startsAt`, `endsAt`, `activatedAt` = null (set on approval)

**invoices:**
- ✅ All required fields populated
- ✅ `invoice_number` auto-generated
- ✅ `status` = 'pending'

**transactions:**
- ✅ All required fields populated
- ✅ `transaction_number` auto-generated
- ✅ `manual_payment_metadata` contains proof details
- ✅ `status` = 'pending'

### No Default Value Fields

All fields without defaults are explicitly set in the service:
- ✅ `userId`, `planId`, `subscriptionId`, `invoiceId`
- ✅ `amount`, `currency`, `paymentGateway`
- ✅ `transactionType`, `transactionContext`, `transactionMethod`
- ✅ All snapshot fields from plan

---

## File Structure

```
src/
├── config/temp/
│   └── manualPaymentUploadConfig.js    # Upload configuration
├── utils/temp/
│   └── paymentProofHelper.js           # URL transformation
├── controllers/temp/
│   └── manualPaymentController.js      # Handles file upload
├── services/temp/
│   └── manualPaymentService.js         # Stores proof metadata
└── routes/temp/
    └── manualPaymentRoutes.js          # Routes

uploads/
└── manual_payments/                     # Local storage (if not Cloudinary)
    └── abc123.jpg
```

---

## Key Features

1. ✅ **File Upload:** Multer middleware handles file upload
2. ✅ **Storage Agnostic:** Works with both Cloudinary and local storage
3. ✅ **Relative Paths:** Database stores relative paths
4. ✅ **Full URLs:** API returns full URLs for display
5. ✅ **Enriched Data:** List API includes transaction, invoice, and plan details
6. ✅ **No Model Hooks:** All logic in service/controller (temporary module)
7. ✅ **Easy Cleanup:** All code in `temp/` folders

---

## Verification Flow

1. **User Submits:**
   - Uploads payment proof (optional)
   - Proof stored in `manual_payment_metadata`
   - Subscription status = `pending`

2. **Admin Views:**
   - Lists pending subscriptions
   - Sees payment proof with full URL
   - Views transaction, invoice, and plan details

3. **Admin Verifies:**
   - Approves or rejects
   - Updates subscription, invoice, and transaction status

---

## Cleanup (When Payment Gateway Ready)

Delete these files:
```bash
rm -rf src/config/temp/
rm -rf src/utils/temp/
rm -rf src/controllers/temp/
rm -rf src/services/temp/
rm -rf src/routes/temp/
rm -rf uploads/manual_payments/  # If using local storage
```

Update routes:
```javascript
// Remove from src/routes/index.js
import manualPaymentRoutes from './temp/manualPaymentRoutes.js';
router.use('/manual-payments', manualPaymentRoutes);
```

---

## Testing

### Test File Upload

```bash
# Create test image
echo "test" > test_proof.jpg

# Submit subscription
curl -X POST http://localhost:5000/api/manual-payments/subscribe \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "planId=1" \
  -F "upiId=test@paytm" \
  -F "transactionId=TEST123" \
  -F "paymentProof=@test_proof.jpg"
```

### Test List with Proof

```bash
# List pending subscriptions
curl -X GET "http://localhost:5000/api/manual-payments/subscriptions?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check response includes:
# - transaction.manualPaymentMetadata.paymentProof.fullUrl
# - planDetails
# - invoice details
```

---

## Summary

✅ **Payment proof upload implemented**
✅ **Stored in `manual_payment_metadata` JSON column**
✅ **Supports Cloudinary and local storage**
✅ **Relative paths in database, full URLs in API**
✅ **List API enriched with transaction, invoice, and plan details**
✅ **No model hooks (all logic in service/controller)**
✅ **Easy to remove (all in `temp/` folders)**

**Everything is isolated and ready for cleanup when payment gateway is implemented!**
