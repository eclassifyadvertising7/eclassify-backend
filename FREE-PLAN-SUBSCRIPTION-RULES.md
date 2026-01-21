# Free Plan Subscription Rules

## Overview

Free plan subscriptions have special handling to prevent unnecessary invoice/transaction records and enforce proper upgrade/downgrade rules.

## Key Rules

### 1. Auto-Activation for Free Plans
When a user subscribes to a free plan via `subscribeToPlan()`:
- ✅ Subscription record is created with `status: 'active'`
- ✅ `activatedAt` is set to current timestamp
- ✅ Previous subscription is expired (if exists)
- ❌ NO invoice record is created
- ❌ NO transaction record is created
- ❌ NO payment validation required
- Transaction commits immediately after subscription creation

**Payment method:** `"free_plan"`
**Success message:** `"Free plan activated successfully"`

### 2. Free Plan Subscription Conditions

**To subscribe to a free plan, user must meet BOTH conditions:**

#### Condition 1: No Active Free Plan
- User must NOT already have an active free plan for that category
- Error: `"You already have an active free plan for this category"`

#### Condition 2: Quota Exhaustion (if downgrading from paid)
- If user has a paid plan, they must have exhausted their quota limit
- Check: `listingCount >= listingQuotaLimit`
- Error: `"Cannot downgrade to free plan. You have used X of Y listings. Please exhaust your current quota first."`

### 3. Free Plans Cannot Use Manual Payment
- Free plans are blocked from manual payment flow
- Error: `"Free plans cannot be purchased through manual payment. Please use the regular subscription flow."`

## Implementation Details

### Modified Methods

#### 1. subscribeToPlan() - src/services/subscriptionService.js
**For Free Plans:**
```javascript
// Skip payment validation
if (plan.isFreePlan) {
  // Create subscription with ACTIVE status (auto-approved)
  const subscription = await createSubscription({
    status: 'active',
    activatedAt: new Date(),
    paymentMethod: 'free_plan',
    amountPaid: 0,
    notes: 'Free plan - Auto-activated'
  });
  
  // Expire previous subscription
  if (existingSubscription) {
    await updateSubscription(existingSubscription.id, { status: 'expired' });
  }
  
  // Commit and return (no invoice/transaction)
  await transaction.commit();
  return { success: true, message: 'Free plan activated successfully', data: subscription };
}

// For paid plans, continue with payment verification
const paymentVerified = await verifyPaymentWithGateway(...);
```

**For Paid Plans:**
```javascript
// Verify payment first
const paymentVerified = await verifyPaymentWithGateway(...);

// Create subscription with ACTIVE status
const subscription = await createSubscription({
  status: 'active',
  activatedAt: new Date(),
  paymentMethod: paymentData.paymentMethod,
  amountPaid: paymentVerified.amountPaid
});

// Create invoice and transaction
const invoice = await invoiceRepository.create({...});
const transaction = await transactionRepository.create({...});
```

#### 2. createSubscriptionManually() - src/services/subscriptionService.js
```javascript
// Same logic as subscribeToPlan
if (plan.isFreePlan) {
  await transaction.commit();
  return { success: true, data: subscription };
}
```

#### 3. createManualSubscription() - src/services/temp/manualPaymentService.js
```javascript
// Block free plans from manual payment flow
if (plan.isFreePlan) {
  throw new Error('Free plans cannot be purchased through manual payment...');
}
```

### Validation Logic

```javascript
// Special validation for free plan subscriptions
if (plan.isFreePlan) {
  // Check if user already has active free plan for this category
  if (existingSubscription && existingSubscription.isFreePlan) {
    throw new Error('You already have an active free plan for this category');
  }
  
  // Check if user has exhausted quota (if they have a paid plan)
  if (existingSubscription && !existingSubscription.isFreePlan) {
    const listingCount = await Listing.count({
      where: {
        userId,
        userSubscriptionId: existingSubscription.id,
        status: { [Op.in]: ['pending', 'active', 'sold', 'expired'] }
      }
    });
    
    if (listingCount < existingSubscription.listingQuotaLimit) {
      throw new Error(
        `Cannot downgrade to free plan. You have used ${listingCount} of ${existingSubscription.listingQuotaLimit} listings. Please exhaust your current quota first.`
      );
    }
  }
}
```

## Use Cases

### Use Case 1: New User Subscribes to Free Plan
**Scenario:** User has no existing subscription

**Flow:**
1. Check existing subscription → NULL
2. Validate free plan conditions → PASS (no existing free plan)
3. Skip payment validation (free plan)
4. Create subscription record with `status: 'active'`, `activatedAt: NOW`
5. Skip invoice/transaction creation
6. Commit and return

**Result:** ✅ Success, subscription immediately active, no invoice/transaction created

**Response:**
```json
{
  "success": true,
  "message": "Free plan activated successfully",
  "data": {
    "id": 123,
    "status": "active",
    "activatedAt": "2025-01-05T10:30:00Z",
    "paymentMethod": "free_plan",
    "amountPaid": 0
  }
}
```

---

### Use Case 2: User Already Has Free Plan
**Scenario:** User has active Cars Free Plan, tries to subscribe to Cars Free Plan again

**Flow:**
1. Check existing subscription → Cars Free Plan (isFreePlan=true)
2. Validate free plan conditions → FAIL (already has free plan)
3. Throw error

**Result:** ❌ Error: "You already have an active free plan for this category"

---

### Use Case 3: Downgrade from Paid to Free (Quota Not Exhausted)
**Scenario:** User has Cars Basic Plan with 5/10 listings used, tries to downgrade to Cars Free Plan

**Flow:**
1. Check existing subscription → Cars Basic Plan (isFreePlan=false)
2. Validate free plan conditions → Check quota
3. Count listings → 5
4. Compare: 5 < 10 → FAIL
5. Throw error

**Result:** ❌ Error: "Cannot downgrade to free plan. You have used 5 of 10 listings. Please exhaust your current quota first."

---

### Use Case 4: Downgrade from Paid to Free (Quota Exhausted)
**Scenario:** User has Cars Basic Plan with 10/10 listings used, downgrades to Cars Free Plan

**Flow:**
1. Check existing subscription → Cars Basic Plan (isFreePlan=false)
2. Validate free plan conditions → Check quota
3. Count listings → 10
4. Compare: 10 >= 10 → PASS
5. Skip payment validation (free plan)
6. Create subscription record with `status: 'active'`, `activatedAt: NOW`
7. Expire old subscription
8. Skip invoice/transaction creation
9. Commit and return

**Result:** ✅ Success, Cars Basic expires, Cars Free active immediately, no invoice/transaction created

**Response:**
```json
{
  "success": true,
  "message": "Free plan activated successfully",
  "data": {
    "id": 124,
    "status": "active",
    "activatedAt": "2025-01-05T10:35:00Z",
    "paymentMethod": "free_plan"
  }
}
```

---

### Use Case 5: Free Plan via Manual Payment
**Scenario:** User tries to purchase free plan through manual payment flow

**Flow:**
1. Check if plan is free → TRUE
2. Throw error immediately

**Result:** ❌ Error: "Free plans cannot be purchased through manual payment. Please use the regular subscription flow."

---

### Use Case 6: Upgrade from Free to Paid
**Scenario:** User has Cars Free Plan, upgrades to Cars Premium

**Flow:**
1. Check existing subscription → Cars Free Plan (isFreePlan=true)
2. No quota check needed (free plan users can upgrade anytime)
3. Validate payment (paid plan)
4. Verify payment with gateway
5. Create subscription record with `status: 'active'`, `activatedAt: NOW`
6. Expire old subscription
7. Create invoice and transaction (paid plan)
8. Commit and return

**Result:** ✅ Success, Cars Free expires, Cars Premium active, invoice/transaction created

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 125,
    "status": "active",
    "activatedAt": "2025-01-05T10:40:00Z",
    "paymentMethod": "razorpay",
    "amountPaid": 999
  }
}
```

## Database Impact

### Free Plan Subscription
```sql
-- Only this record is created
INSERT INTO user_subscriptions (...) VALUES (...);

-- Previous subscription expired (if exists)
UPDATE user_subscriptions SET status='expired', ends_at=NOW() WHERE id=?;

-- NO invoice record
-- NO transaction record
```

### Paid Plan Subscription
```sql
-- Subscription record
INSERT INTO user_subscriptions (...) VALUES (...);

-- Previous subscription expired (if exists)
UPDATE user_subscriptions SET status='expired', ends_at=NOW() WHERE id=?;

-- Invoice record
INSERT INTO invoices (...) VALUES (...);

-- Transaction record
INSERT INTO transactions (...) VALUES (...);
```

## Benefits

1. **Instant Activation**: Free plans are immediately active - no waiting for approval
2. **Cleaner Database**: No unnecessary invoice/transaction records for free plans
3. **Prevents Abuse**: Users can't have multiple free plans for same category
4. **Fair Downgrade**: Users must exhaust paid quota before downgrading to free
5. **Consistent Logic**: Same validation rules across all subscription methods
6. **Clear Errors**: Descriptive error messages for each validation failure
7. **Single Endpoint**: Frontend uses same endpoint for all subscriptions
8. **Better UX**: Users get immediate feedback for free plan subscriptions

## Testing Checklist

- [ ] New user can subscribe to free plan (immediately active, no invoice/transaction)
- [ ] Free plan subscription returns `status: 'active'` and `activatedAt` timestamp
- [ ] User with free plan cannot subscribe to same free plan again
- [ ] User with paid plan (quota not exhausted) cannot downgrade to free
- [ ] User with paid plan (quota exhausted) can downgrade to free (immediately active)
- [ ] Free plan cannot be purchased via manual payment
- [ ] User with free plan can upgrade to paid plan anytime
- [ ] Free plan subscription expires old subscription (same category)
- [ ] Free plan subscription doesn't affect other category subscriptions
- [ ] Frontend receives success message: "Free plan activated successfully"
- [ ] Paid plan subscriptions still create invoice/transaction records
