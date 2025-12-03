# Manual Payment Flow Implementation

## Overview

This document describes the temporary manual payment verification flow for subscriptions. This implementation allows the system to function without a payment gateway while maintaining data integrity and providing a clear path for future payment gateway integration.

## Current Flow

### End User Journey

1. **Select Plan**
   - User browses available plans: `GET /api/end-user/subscriptions/plans`
   - User views plan details: `GET /api/end-user/subscriptions/plans/:id`

2. **Make Payment**
   - QR code displayed on screen
   - User makes payment via UPI/Bank Transfer
   - User clicks "Complete Payment"

3. **Submit Payment Details**
   - Form appears with fields:
     - UPI ID (required)
     - Transaction ID (required)
     - Payment Proof URL (optional)
     - Customer Name (optional, defaults to user's name)
     - Customer Mobile (optional, defaults to user's mobile)
   
   ```javascript
   POST /api/end-user/subscriptions
   {
     "planId": 4,
     "upiId": "user@paytm",
     "transactionId": "T2025011512345678",
     "paymentProof": "https://example.com/proof.jpg",
     "customerName": "John Doe",
     "customerMobile": "9876543210"
   }
   ```

4. **Pending Status**
   - Subscription created with status: `pending`
   - Invoice created with status: `pending`
   - Transaction created with status: `pending`
   - User receives confirmation: "Subscription request submitted. Pending admin verification."

### Admin Verification

1. **View Pending Subscriptions**
   ```javascript
   GET /api/panel/subscriptions?status=pending
   ```

2. **Review Payment Details**
   ```javascript
   GET /api/panel/subscriptions/:id
   ```
   - Check UPI ID, Transaction ID, Payment Proof
   - Verify payment in bank statement/UPI app

3. **Approve or Reject**
   ```javascript
   POST /api/panel/subscriptions/:id/verify-payment
   {
     "approved": true,
     "notes": "Payment verified via bank statement"
   }
   ```

### What Happens on Approval

**Subscription Table:**
- `status`: `pending` → `active`
- `startsAt`: `null` → current timestamp
- `endsAt`: `null` → calculated (startsAt + plan duration)
- `activatedAt`: `null` → current timestamp
- `amountPaid`: `0` → plan's finalPrice

**Invoice Table:**
- `status`: `pending` → `paid`
- `amountPaid`: `0` → plan's finalPrice
- `amountDue`: plan's finalPrice → `0`
- `paymentDate`: `null` → current timestamp

**Transaction Table:**
- `status`: `pending` → `completed`
- `completedAt`: `null` → current timestamp
- `verifiedBy`: admin user ID
- `verifiedAt`: current timestamp
- `verificationNotes`: admin's notes

### What Happens on Rejection

**Subscription Table:**
- `status`: `pending` → `cancelled`
- `cancelledAt`: current timestamp
- `cancellationReason`: admin's notes

**Invoice Table:**
- `status`: `pending` → `cancelled`

**Transaction Table:**
- `status`: `pending` → `failed`
- `failureReason`: admin's notes
- `verifiedBy`: admin user ID
- `verifiedAt`: current timestamp

## Database Tables Involved

### user_subscriptions
- Stores subscription with plan snapshot
- Status: `pending` → `active` or `cancelled`
- Dates set on approval: `startsAt`, `endsAt`, `activatedAt`

### invoices
- Stores invoice details
- Status: `pending` → `paid` or `cancelled`
- Invoice number auto-generated: `INV-2025-00001`

### transactions
- Stores transaction details
- Status: `pending` → `completed` or `failed`
- Transaction number auto-generated: `TXN-2025-00001`
- Manual payment metadata stored in `manual_payment_metadata` JSON field

## Code Structure

### Files Modified

1. **src/services/subscriptionService.js**
   - `subscribeToPlan()` - Manual payment flow (active)
   - `subscribeToPlan()` - Payment gateway flow (commented)
   - `verifyManualPayment()` - Admin verification (TEMPORARY)
   - `_verifyPaymentWithGateway()` - Gateway verification (TO BE IMPLEMENTED)

2. **src/controllers/end-user/subscriptionController.js**
   - `subscribeToPlan()` - Manual payment flow (active)
   - `subscribeToPlan()` - Payment gateway flow (commented)

3. **src/controllers/panel/subscriptionController.js**
   - `verifyManualPayment()` - Admin verification endpoint (TEMPORARY)

4. **src/routes/panel/subscriptionRoutes.js**
   - `POST /:id/verify-payment` - Verification route (TEMPORARY)

5. **src/repositories/subscriptionRepository.js**
   - `createInvoice()` - Create invoice record
   - `findInvoiceBySubscriptionId()` - Find invoice
   - `updateInvoice()` - Update invoice
   - `createTransaction()` - Create transaction record
   - `findTransactionBySubscriptionId()` - Find transaction
   - `updateTransaction()` - Update transaction

### Files Created

1. **src/models/Invoice.js** - Invoice model
2. **src/models/Transaction.js** - Transaction model

## Switching to Payment Gateway

When ready to implement payment gateway (Razorpay, Stripe, etc.):

### Step 1: Comment Out Manual Payment Code

**In `src/services/subscriptionService.js`:**
```javascript
// Comment out lines 150-250 (manual payment section)
// Uncomment lines 252-380 (payment gateway section)
```

**In `src/controllers/end-user/subscriptionController.js`:**
```javascript
// Comment out lines 25-50 (manual payment section)
// Uncomment lines 52-75 (payment gateway section)
```

### Step 2: Implement Payment Gateway Verification

**In `src/services/subscriptionService.js`:**
```javascript
async _verifyPaymentWithGateway(paymentMethod, transactionId, expectedAmount) {
  // Example for Razorpay:
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  const payment = await razorpay.payments.fetch(transactionId);
  
  if (payment.status === 'captured' && payment.amount === expectedAmount * 100) {
    return {
      success: true,
      amountPaid: payment.amount / 100,
      orderId: payment.order_id,
      signature: payment.signature,
      rawResponse: payment
    };
  }
  
  return {
    success: false,
    message: 'Payment verification failed'
  };
}
```

### Step 3: Remove Manual Verification Endpoint

**In `src/routes/panel/subscriptionRoutes.js`:**
```javascript
// Remove or comment out:
// router.post('/:id/verify-payment', SubscriptionController.verifyManualPayment);
```

**In `src/controllers/panel/subscriptionController.js`:**
```javascript
// Remove or comment out verifyManualPayment() method
```

**In `src/services/subscriptionService.js`:**
```javascript
// Remove or comment out verifyManualPayment() method
```

### Step 4: Update API Documentation

Remove manual payment sections from `API-Docs/subscriptions.md` and update with payment gateway flow.

## Security Considerations

### Current Manual Flow
- ✅ Requires authentication
- ✅ Admin verification prevents fraud
- ✅ All payment details stored for audit
- ⚠️ Manual process - slower activation
- ⚠️ Relies on admin diligence

### Future Payment Gateway Flow
- ✅ Automated verification
- ✅ Instant activation
- ✅ Gateway-level fraud protection
- ✅ Webhook support for async updates
- ✅ Refund support

## Testing

### Manual Payment Flow

1. **Create Subscription (End User)**
   ```bash
   POST /api/end-user/subscriptions
   Authorization: Bearer <user_token>
   {
     "planId": 1,
     "upiId": "test@paytm",
     "transactionId": "TEST123456",
     "paymentProof": "https://example.com/proof.jpg"
   }
   ```

2. **Verify Pending Status**
   ```bash
   GET /api/end-user/subscriptions/active
   # Should return 404 - No active subscription
   
   GET /api/end-user/subscriptions?status=pending
   # Should return the pending subscription
   ```

3. **Admin Approval**
   ```bash
   POST /api/panel/subscriptions/:id/verify-payment
   Authorization: Bearer <admin_token>
   {
     "approved": true,
     "notes": "Payment verified"
   }
   ```

4. **Verify Active Status**
   ```bash
   GET /api/end-user/subscriptions/active
   # Should return the active subscription
   ```

## Benefits of This Approach

1. **Clean Separation**: Manual and gateway flows are clearly separated
2. **Easy Toggle**: Comment/uncomment to switch between flows
3. **Data Integrity**: All tables (subscriptions, invoices, transactions) maintained consistently
4. **Audit Trail**: Complete history of payment verification
5. **No Data Loss**: When switching to gateway, existing data remains intact
6. **Testable**: Can test both flows independently

## Notes

- `startsAt` and `activatedAt` will be the same (set when admin approves)
- `createdAt` can be different (set when user submits)
- This allows tracking of submission time vs activation time
- Invoice and transaction numbers are auto-generated and year-based
- All audit fields (`createdBy`, `updatedBy`, `deletedBy`) are maintained
