# Subscription Category Isolation - Test Verification

## Implementation Verification

All three subscription creation methods correctly isolate subscriptions by category:

### 1. subscribeToPlan() - Line 400-559
```javascript
// Fetches subscription for SAME CATEGORY only
const existingCategorySubscription = await getUserActiveSubscriptionByCategory(
  userId,
  plan.categoryId  // ← Filters by new plan's category
);

// Expires ONLY the subscription from SAME CATEGORY
if (existingCategorySubscription) {
  await updateSubscription(existingCategorySubscription.id, {
    status: 'expired',
    endsAt: new Date()
  });
}
```

### 2. createManualSubscription() - Line 52-175
```javascript
// Fetches subscription for SAME CATEGORY only
const existingSubscription = await getUserActiveSubscriptionByCategory(
  userId,
  plan.categoryId  // ← Filters by new plan's category
);

// Expires ONLY the subscription from SAME CATEGORY
if (existingSubscription) {
  await updateSubscription(existingSubscription.id, {
    status: 'expired',
    endsAt: new Date()
  });
}
```

### 3. createSubscriptionManually() - Line 900-1020
```javascript
// Fetches subscription for SAME CATEGORY only
const existingCategorySubscription = await getUserActiveSubscriptionByCategory(
  userId,
  plan.categoryId  // ← Filters by new plan's category
);

// Expires ONLY the subscription from SAME CATEGORY
if (existingCategorySubscription) {
  await updateSubscription(existingCategorySubscription.id, {
    status: 'expired',
    endsAt: new Date()
  });
}
```

## How Category Isolation Works

### Repository Method: getUserActiveSubscriptionByCategory()
```javascript
async getUserActiveSubscriptionByCategory(userId, categoryId) {
  return await UserSubscription.findOne({
    where: {
      userId,
      status: 'active'
    },
    include: [{
      model: SubscriptionPlan,
      as: 'plan',
      where: { categoryId },  // ← SQL JOIN filters by categoryId
      attributes: ['id', 'name', 'slug', 'planCode', 'version', 'categoryId', 'isFreePlan']
    }]
  });
}
```

This method uses a SQL JOIN with `WHERE categoryId = ?`, ensuring it returns:
- **ONLY ONE** subscription (findOne)
- **ONLY** for the specified category
- **ONLY** if status is 'active'

## Test Scenarios - Category Isolation

### Scenario 1: User has Cars Free + Properties Free
**Initial State:**
- Cars Free Plan (ID: 1, Category: Cars, Status: active)
- Properties Free Plan (ID: 2, Category: Properties, Status: active)

**Action:** User upgrades to Cars Premium Plan

**Expected Result:**
- Cars Free Plan → Status: expired ✅
- Properties Free Plan → Status: active ✅ (UNCHANGED)
- Cars Premium Plan → Status: active ✅ (NEW)

**Why it works:**
- `getUserActiveSubscriptionByCategory(userId, carsCategory)` returns ONLY Cars Free Plan
- Only Cars Free Plan gets expired
- Properties Free Plan is never touched

---

### Scenario 2: User has Cars Paid + Properties Free
**Initial State:**
- Cars Basic Plan (ID: 3, Category: Cars, Status: active, 10/10 quota used)
- Properties Free Plan (ID: 4, Category: Properties, Status: active)

**Action:** User upgrades to Cars Premium Plan

**Expected Result:**
- Cars Basic Plan → Status: expired ✅
- Properties Free Plan → Status: active ✅ (UNCHANGED)
- Cars Premium Plan → Status: active ✅ (NEW)

**Why it works:**
- `getUserActiveSubscriptionByCategory(userId, carsCategory)` returns ONLY Cars Basic Plan
- Quota check passes (10/10 used)
- Only Cars Basic Plan gets expired
- Properties Free Plan is never touched

---

### Scenario 3: User has Cars Free, buys Properties Paid
**Initial State:**
- Cars Free Plan (ID: 5, Category: Cars, Status: active)

**Action:** User buys Properties Premium Plan

**Expected Result:**
- Cars Free Plan → Status: active ✅ (UNCHANGED)
- Properties Premium Plan → Status: active ✅ (NEW)

**Why it works:**
- `getUserActiveSubscriptionByCategory(userId, propertiesCategory)` returns NULL (no existing Properties subscription)
- No subscription to expire
- Cars Free Plan is never touched (different category)

---

### Scenario 4: User has Cars Paid (5/10 quota), tries to buy Properties Paid
**Initial State:**
- Cars Basic Plan (ID: 6, Category: Cars, Status: active, 5/10 quota used)

**Action:** User buys Properties Premium Plan

**Expected Result:**
- Cars Basic Plan → Status: active ✅ (UNCHANGED)
- Properties Premium Plan → Status: active ✅ (NEW)

**Why it works:**
- `getUserActiveSubscriptionByCategory(userId, propertiesCategory)` returns NULL
- No quota check needed (different category)
- Cars Basic Plan is never touched

---

### Scenario 5: User has Cars Paid (5/10 quota), tries to upgrade Cars
**Initial State:**
- Cars Basic Plan (ID: 7, Category: Cars, Status: active, 5/10 quota used)

**Action:** User tries to upgrade to Cars Premium Plan

**Expected Result:**
- ❌ ERROR: "Cannot upgrade. You have used 5 of 10 listings. Please exhaust your current quota before upgrading."
- Cars Basic Plan → Status: active (UNCHANGED)

**Why it works:**
- `getUserActiveSubscriptionByCategory(userId, carsCategory)` returns Cars Basic Plan
- Quota check: 5 < 10 → FAIL
- Transaction rolled back, no changes made

## SQL Query Example

When calling `getUserActiveSubscriptionByCategory(userId=123, categoryId=1)`:

```sql
SELECT 
  user_subscriptions.*,
  subscription_plans.id,
  subscription_plans.name,
  subscription_plans.category_id,
  subscription_plans.is_free_plan
FROM user_subscriptions
INNER JOIN subscription_plans 
  ON user_subscriptions.plan_id = subscription_plans.id
WHERE 
  user_subscriptions.user_id = 123
  AND user_subscriptions.status = 'active'
  AND subscription_plans.category_id = 1  -- ← Category filter
LIMIT 1;
```

This query **physically cannot** return subscriptions from other categories due to the JOIN condition.

## Conclusion

✅ **Category isolation is guaranteed** by the database query itself
✅ **No risk** of expiring subscriptions from other categories
✅ **Each category** is completely independent
✅ **Free plans** in other categories are safe when upgrading one category
