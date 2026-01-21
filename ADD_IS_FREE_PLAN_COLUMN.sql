-- Add is_free_plan column to user_subscriptions table
-- This column stores a snapshot of the plan's free status at subscription creation time

ALTER TABLE user_subscriptions 
ADD COLUMN is_free_plan BOOLEAN NOT NULL DEFAULT false;

-- Add comment to the column for documentation
COMMENT ON COLUMN user_subscriptions.is_free_plan IS 'Snapshot: indicates if this subscription is from a free plan';

-- Optional: Update existing records based on plan_code or final_price
-- Uncomment if you want to populate existing records

-- Update existing subscriptions where final_price is 0 (likely free plans)
-- UPDATE user_subscriptions 
-- SET is_free_plan = true 
-- WHERE final_price = 0 AND base_price = 0;

-- Or update based on subscription_plans table (more accurate)
-- UPDATE user_subscriptions us
-- SET is_free_plan = sp.is_free_plan
-- FROM subscription_plans sp
-- WHERE us.plan_id = sp.id;
