# Free Plan Assignment Implementation

## Overview

Updated the user registration flow to automatically assign **all free plans** (one per category) to new users instead of a single generic free plan.

## Changes Made

### 1. Repository Layer (`src/repositories/subscriptionRepository.js`)

**Added Category model import:**
```javascript
const { SubscriptionPlan, UserSubscription, User, Category } = db;
```

**Updated `getAllFreePlans()` method:**
- Queries all plans where `is_free_plan = true` and `is_active = true`
- Returns plans ordered by `category_id`
- Simplified to remove Category include (not needed for assignment)

### 2. Service Layer (`src/services/authService.js`)

**Updated `_assignFreeSubscription()` method:**

**Before:**
- Queried single plan by slug `'free'`
- Would fail because actual slugs are `'cars-free'` and `'properties-free'`
- Only assigned one subscription

**After:**
- Calls `subscriptionRepository.getAllFreePlans()`
- Returns array of all free plans (one per category)
- Uses `Promise.all()` to assign all free plans concurrently
- Logs count of assigned plans for monitoring

**Key improvements:**
- ✅ Assigns free plan for **cars** category
- ✅ Assigns free plan for **properties** category
- ✅ Scalable - automatically handles new categories with free plans
- ✅ Concurrent assignment for better performance
- ✅ Better error logging

## Database Schema

The `is_free_plan` flag in `subscription_plans` table:
- Already exists in migration
- Already populated correctly by seeder
- `true` for free plans (cars-free, properties-free)
- `false` for paid plans (basic, standard, premium)

## Testing

### Verify Seeded Data

Run the test query:
```bash
psql -d your_database -f test-free-plans.sql
```

Expected output:
```
 id | plan_code        | name                | category_id | category_name | is_free_plan | is_active | final_price | listing_quota_limit | max_active_listings
----+------------------+---------------------+-------------+---------------+--------------+-----------+-------------+---------------------+--------------------
  1 | cars-free        | Cars Free Plan      |           1 | Cars          | t            | t         |        0.00 |                   1 |                   1
  5 | properties-free  | Properties Free Plan|           2 | Properties    | t            | t         |        0.00 |                   1 |                   1
```

### Test User Registration

1. Register a new user via API
2. Check `user_subscriptions` table:
```sql
SELECT 
  us.id,
  us.user_id,
  us.plan_code,
  us.plan_name,
  us.status,
  sp.category_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = <new_user_id>
ORDER BY sp.category_id;
```

Expected: 2 active subscriptions (one for cars, one for properties)

### Check Server Logs

After registration, you should see:
```
Assigned 2 free plans to user <user_id>
```

## Benefits

1. **Category-specific quotas**: Users get separate quotas for cars and properties
2. **Scalable**: Automatically handles new categories with free plans
3. **No manual intervention**: Works out of the box with seeded data
4. **Better UX**: Users can post in multiple categories immediately
5. **Consistent with paid plans**: Paid plans are also category-specific

## Future Considerations

If you add more categories (e.g., electronics, furniture):
1. Create free plan in seeder with `is_free_plan: true`
2. No code changes needed - automatically assigned on registration
3. Existing users won't get new free plans (only new registrations)

## Rollback

If you need to revert to single free plan:
1. Restore old `_assignFreeSubscription()` method
2. Update seeder to create single `'free'` plan with `slug: 'free'`
3. Remove category-specific free plans

## Notes

- Free plans have 25-year duration (9125 days) but are quota-based
- Plans expire when quota is exhausted, not by time
- `is_free_plan` flag is the source of truth for identifying free plans
- No need for additional `is_paid` flag (redundant)
