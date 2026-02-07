-- Fix existing listings that are missing user_subscription_id
-- This script links listings to their user's active subscription for the listing's category

UPDATE listings l
SET 
  user_subscription_id = us.id,
  is_paid_listing = CASE 
    WHEN sp.is_free_plan = false THEN true 
    ELSE false 
  END
FROM user_subscriptions us
INNER JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE 
  l.user_subscription_id IS NULL
  AND l.user_id = us.user_id
  AND sp.category_id = l.category_id
  AND us.status = 'active'
  AND l.status IN ('pending', 'active', 'sold', 'expired');

-- Check results
SELECT 
  l.id,
  l.title,
  l.status,
  l.user_subscription_id,
  l.is_paid_listing,
  us.plan_name
FROM listings l
LEFT JOIN user_subscriptions us ON l.user_subscription_id = us.id
WHERE l.user_id = 3
ORDER BY l.created_at DESC;
