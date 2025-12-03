# Manual Payment API - Quick Summary

## Two Main APIs

### 1. List Manual Subscriptions (with filters)
**Endpoint:** `GET /api/panel/subscriptions`

**Filters Available:**
- ✅ `status` - pending, active, cancelled, expired, suspended
- ✅ `dateFrom` / `dateTo` - Date range filter
- ✅ `search` - Search by customer name OR mobile number
- ✅ `userId` - Filter by specific user
- ✅ `planId` - Filter by specific plan
- ✅ `page` / `limit` - Pagination

**Example:**
```bash
GET /api/panel/subscriptions?status=pending&search=John&dateFrom=2025-01-01
```

### 2. Verify or Cancel Subscription
**Endpoint:** `POST /api/panel/subscriptions/:id/verify-payment`

**Request Body:**
```json
{
  "approved": true,  // or false
  "notes": "Payment verified via bank statement"
}
```

**What it does:**
- If `approved: true` → Activates subscription, updates invoice & transaction to paid/completed
- If `approved: false` → Cancels subscription, marks invoice & transaction as cancelled/failed

---

## End User Subscription API

### Current (Manual Payment)
**Endpoint:** `POST /api/end-user/subscriptions`

**Request:**
```json
{
  "planId": 4,
  "upiId": "user@paytm",
  "transactionId": "T2025011512345678",
  "paymentProof": "https://example.com/proof.jpg"
}
```

**Response:** Status = `pending` (needs admin verification)

### Future (Payment Gateway)
**Same Endpoint:** `POST /api/end-user/subscriptions`

**Request:**
```json
{
  "planId": 4,
  "paymentData": {
    "paymentMethod": "razorpay",
    "transactionId": "pay_abc123xyz",
    "amountPaid": 899.00
  }
}
```

**Response:** Status = `active` (immediate activation)

---

## Does End User API Need Changes?

**Answer: YES, but minimal**

### What Changes:
1. **Request body structure** - From flat fields to nested `paymentData` object
2. **Response status** - From `pending` to `active`
3. **No admin verification** - Immediate activation

### What Stays Same:
1. ✅ Same endpoint URL
2. ✅ Same authentication
3. ✅ Same response structure (just different status)

### How to Switch:
1. Comment/uncomment marked sections in code
2. Update frontend form to collect payment gateway data
3. Remove admin verification endpoints

---

## Quick Reference

| Feature | Current (Manual) | Future (Gateway) |
|---------|------------------|------------------|
| Endpoint | Same | Same |
| Request | Flat fields (upiId, transactionId) | Nested paymentData object |
| Status | pending | active |
| Verification | Admin manual | Automatic |
| Activation | After admin approval | Immediate |

---

## Files to Check

- **API Docs:** `API-Docs/manual-payment-verification.md`
- **Implementation Guide:** `MANUAL-PAYMENT-IMPLEMENTATION.md`
- **Code:** 
  - `src/services/subscriptionService.js`
  - `src/controllers/end-user/subscriptionController.js`
  - `src/controllers/panel/subscriptionController.js`
