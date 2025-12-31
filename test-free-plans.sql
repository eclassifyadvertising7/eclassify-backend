-- Test query to verify free plans are correctly seeded
-- Run this after seeding to confirm is_free_plan flag is set correctly

SELECT 
  id,
  plan_code,
  name,
  category_id,
  category_name,
  is_free_plan,
  is_active,
  final_price,
  listing_quota_limit,
  max_active_listings
FROM subscription_plans
WHERE is_free_plan = true
ORDER BY category_id ASC;

-- Expected result: 2 rows
-- 1. cars-free (category_id for cars)
-- 2. properties-free (category_id for properties)
