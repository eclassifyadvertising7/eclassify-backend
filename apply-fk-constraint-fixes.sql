-- Apply FK constraint fixes to existing database
-- Run this SQL directly on your database

-- ============================================
-- 1. USER SUBSCRIPTIONS - RESTRICT user_id, SET NULL plan_id
-- ============================================
-- user_id: RESTRICT (users are soft-deleted, prevent hard delete)
ALTER TABLE user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey,
  ADD CONSTRAINT user_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- plan_id: RESTRICT (plans are soft-deleted, prevent hard delete)
ALTER TABLE user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey,
  ADD CONSTRAINT user_subscriptions_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- ============================================
-- 2. LISTINGS - CASCADE (delete with user)
-- ============================================
ALTER TABLE listings 
  DROP CONSTRAINT IF EXISTS listings_user_id_fkey,
  ADD CONSTRAINT listings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================
-- 3. CHAT ROOMS - CASCADE (delete with user or listing)
-- ============================================
-- Chat rooms are deleted when:
-- - Listing is deleted (CASCADE from listing_id)
-- - Either buyer or seller is deleted (CASCADE from buyer_id/seller_id)

ALTER TABLE chat_rooms 
  DROP CONSTRAINT IF EXISTS chat_rooms_buyer_id_fkey,
  ADD CONSTRAINT chat_rooms_buyer_id_fkey 
    FOREIGN KEY (buyer_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE chat_rooms 
  DROP CONSTRAINT IF EXISTS chat_rooms_seller_id_fkey,
  ADD CONSTRAINT chat_rooms_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================
-- 4. LISTING OFFERS - CASCADE (delete with user, listing, or chat)
-- ============================================
-- Offers are deleted when:
-- - Listing is deleted (CASCADE from listing_id)
-- - Chat room is deleted (CASCADE from chat_room_id)
-- - Either buyer or seller is deleted (CASCADE from buyer_id/seller_id)

ALTER TABLE listing_offers 
  DROP CONSTRAINT IF EXISTS listing_offers_buyer_id_fkey,
  ADD CONSTRAINT listing_offers_buyer_id_fkey 
    FOREIGN KEY (buyer_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE listing_offers 
  DROP CONSTRAINT IF EXISTS listing_offers_seller_id_fkey,
  ADD CONSTRAINT listing_offers_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all FK constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'user_subscriptions', 'listings', 'chat_rooms', 
    'listing_offers', 'chat_messages'
  )
ORDER BY tc.table_name, kcu.column_name;
