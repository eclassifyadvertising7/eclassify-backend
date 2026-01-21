# Subscription Upgrade Logic Implementation

## Overview

Modified subscription purchase logic to handle free vs paid plan upgrades differently based on quota usage.

## Business Rules

### Category-Based Subscriptions
- Users can have **multiple active subscriptions** (one per category)
- Example: User can have active subscription for "Cars" AND "Properties" simultaneously
- Upgrade logic applies **per category** - upgrading Cars plan doesn't affect Properties plan

### Free Plan Subscriptions
**Conditions to subscribe to a free plan:**
1. User must NOT have an active free plan for that category
2. If user has a paid plan, they must have exhausted their quota limit

**Special rules:**
- No invoice or transaction records are created for free plans
- Free plans cannot be purchased through manual payment flow
- Free plan users can upgrade to paid plans anytime without restrictions

### Free Plan Users (per category)
- Can upgrade to paid plans **anytime** without any restrictions
- No quota check required
- Identified by `is_free_plan = true` in `user_subscriptions` table

### Paid Plan Users (per category)
- Can only upgrade when they have **exhausted their quota limit**
- System checks `listing_quota_limit` from `user_subscriptions` table
- Compares with count of listings where:
  - `user_id` matches
  - `user_subscription_id` matches current subscription
  - `status` in ['pending', 'active', 'sold', 'expired']

## Implementation

### Files Modified

1. **src/services/subscriptionService.js**
   - Modified `subscribeToPlan()` method (line ~400)
   - Modified `createSubscriptionManually()` method (line ~870)

2. **src/services/temp/manualPaymentService.js**
   - Modified `createManualSubscription()` method (line ~40)
   - Added `Op` import from Sequelize

### Logic Flow

```javascript
// Get plan details first
const plan = await findPlanById(planId);

// Check existing subscription for THIS PLAN'S CATEGORY
const existingSubscription = await getUserActiveSubscriptionByCategory(userId, plan.categoryId);

if (existingSubscription) {
  if (existingSubscription.isFreePlan) {
    // ✅ Allow upgrade - no quota check
  } else {
    // Check quota usage for THIS SUBSCRIPTION
    const listingCount = await Listing.count({
      where: {
        userId,
        userSubscriptionId: existingSubscription.id,
        status: { [Op.in]: ['pending', 'active', 'sold', 'expired'] }
      }
    });
    
    if (listingCount < existingSubscription.listingQuotaLimit) {
      // ❌ Block upgrade - quota not exhausted
      throw new Error(`Cannot upgrade. You have used ${listingCount} of ${listingQuotaLimit} listings.`);
    }
    // ✅ Allow upgrade - quota exhausted
  }
}

// Special validation for FREE PLAN subscriptions
if (plan.isFreePlan) {
  // Check if user already has active free plan for this category
  if (existingSubscription && existingSubscription.isFreePlan) {
    throw new Error('You already have an active free plan for this category');
  }
  
  // Check if user has exhausted quota (if they have a paid plan)
  if (existingSubscription && !existingSubscription.isFreePlan) {
    const listingCount = await Listing.count({...});
    
    if (listingCount < existingSubscription.listingQuotaLimit) {
      throw new Error('Cannot downgrade to free plan. Please exhaust your current quota first.');
    }
  }
}

// Create new subscription
const newSubscription = await createSubscription(subscriptionData, userId);

// Expire previous subscription for THIS CATEGORY if exists
if (existingSubscription) {
  await updateSubscription(existingSubscription.id, {
    status: 'expired',
    endsAt: new Date(),
    notes: 'Expired due to upgrade to new plan'
  });
}

// For FREE PLANS, skip invoice and transaction creation
if (plan.isFreePlan) {
  return { success: true, data: newSubscription };
}

// For PAID PLANS, create invoice and transaction
const invoice = await createInvoice({...});
const transaction = await createTransaction({...});
```

## Database Schema

### user_subscriptions table
- `is_free_plan` (BOOLEAN) - Identifies free vs paid plans
- `listing_quota_limit` (INTEGER) - Maximum listings allowed in rolling window

### listings table
- `user_id` (BIGINT) - Owner of the listing
- `user_subscription_id` (BIGINT) - Links to subscription used for this listing
- `status` (ENUM) - Listing status

## Error Messages

**Paid plan with quota remaining:**
```
Cannot upgrade. You have used X of Y listings. Please exhaust your current quota before upgrading.
```

**Free plan already exists:**
```
You already have an active free plan for this category
```

**Downgrade to free plan with quota remaining:**
```
Cannot downgrade to free plan. You have used X of Y listings. Please exhaust your current quota first.
```

**Free plan through manual payment:**
```
Free plans cannot be purchased through manual payment. Please use the regular subscription flow.
```

## Testing Scenarios

### Single Category Tests
1. **Free plan user upgrades (Cars)** → Should succeed immediately
2. **Paid plan user with 5/10 quota used (Cars)** → Should fail with error
3. **Paid plan user with 10/10 quota used (Cars)** → Should succeed
4. **User with no existing subscription (Cars)** → Should succeed (new subscription)

### Free Plan Subscription Tests
5. **User with no subscription subscribes to free plan** → Should succeed, no invoice/transaction created
6. **User with free plan tries to subscribe to same free plan** → Should fail: "already have active free plan"
7. **User with paid plan (5/10 quota) tries to downgrade to free** → Should fail: "exhaust quota first"
8. **User with paid plan (10/10 quota) downgrades to free** → Should succeed, no invoice/transaction created
9. **User tries to buy free plan via manual payment** → Should fail: "cannot use manual payment"

### Multi-Category Tests
10. **User has Cars free plan, buys Properties paid plan** → Should succeed (different categories)
11. **User has Cars paid plan (5/10 used), buys Properties paid plan** → Should succeed (different categories)
12. **User has Cars paid plan (10/10 used), upgrades to Cars premium** → Should succeed, Cars basic expires
13. **User has active Cars AND Properties plans, upgrades Cars** → Only Cars plan expires, Properties unaffected

## Notes

- Quota check applies **per category** - each category subscription is independent
- Users can have multiple active subscriptions (one per category: Cars, Properties, etc.)
- Free plan users are never blocked from upgrading within their category
- Paid plan users must exhaust quota before upgrading within their category
- **Free plans do NOT create invoice or transaction records**
- Free plans cannot be purchased through manual payment flow (blocked at service level)
- **Previous subscription is automatically expired** when new subscription is created successfully (same category only)
- Previous subscription's `status` is set to 'expired' and `endsAt` is set to current timestamp
- Expiration note is appended to previous subscription's notes field
- Upgrading a Cars plan does NOT affect an active Properties plan (different categories)
- Downgrading from paid to free plan requires quota exhaustion (same rules as upgrading)
