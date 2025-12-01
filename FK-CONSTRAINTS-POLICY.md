# Foreign Key Constraints Policy

## Overview
This document defines the onDelete behavior for all foreign key relationships in the database.

## Deletion Policy by Data Type

### 1. Reference/Master Data → RESTRICT
**Tables:** states, cities, districts, categories, roles, permissions, subscription_plans, car_brands, car_models, car_variants

**Policy:** `onDelete: RESTRICT`

**Reason:** 
- These are lookup/master data tables
- Rarely change or get deleted
- Prevent accidental deletion of data that has dependencies
- Force explicit handling of dependent records first

**Example:**
- Cannot delete a state if any cities reference it
- Cannot delete a city if any listings reference it
- Cannot delete a category if any listings use it

---

### 2. User Deletion → Mixed Strategy

#### User Table (Soft Delete Only)
- Users are NEVER hard-deleted from database
- Use `deleted_at` timestamp for soft delete
- Status changed to 'deleted'

#### When User is Deleted:

**CASCADE (Hard Delete):**
- `user_profiles` → Delete permanently
- `user_sessions` → Delete permanently  
- `user_social_accounts` → Delete permanently
- `listings` → Delete permanently (triggers cascade to all listing-related data)
- `chat_rooms` → Delete permanently (as buyer or seller)
- `listing_offers` → Delete permanently (as buyer or seller)
- `chat_messages` → Delete permanently (via chat_rooms cascade)

**SET NULL (Keep for History):**
- `user_subscriptions` → Keep for billing/audit history

**Reason:**
- User profiles/sessions are personal data - delete with user (GDPR compliance)
- Listings are user-generated content - delete with user
- Chats/offers are tied to listings - delete with user or listing
- Subscriptions are business records - keep for audit/legal

---

### 3. Listing Deletion → CASCADE All Related Data

**When listing is deleted, CASCADE delete:**
- `car_listings` → Listing details
- `property_listings` → Listing details
- `listing_media` → Images/videos
- `data_requests` → Admin data requests
- `chat_rooms` → All chats about this listing
  - `chat_messages` → All messages in those chats (cascade from chat_rooms)
  - `listing_offers` → All offers in those chats (cascade from chat_rooms)

**When user is deleted, CASCADE delete:**
- All listings owned by user (triggers listing cascade above)
- All chat_rooms where user is buyer or seller
- All listing_offers where user is buyer or seller

**Reason:**
- Listing-related data has no meaning without the listing
- Chat/offer data is tied to both listing and users - delete with either
- Clean up all associated data automatically
- Prevent orphaned records

---

### 4. Chat Room Deletion → CASCADE Messages & Offers

**When chat_room is deleted, CASCADE delete:**
- `chat_messages` → All messages in the chat
- `listing_offers` → All offers in the chat

**Reason:**
- Messages and offers belong to the chat room
- No value in keeping them without the chat context

---

### 5. Role/Permission Deletion → CASCADE Junction Table

**When role or permission is deleted, CASCADE delete:**
- `role_permissions` → Junction table entries

**Reason:**
- Junction table entries are meaningless without parent records
- Standard practice for many-to-many relationships

---

## Migration to Apply Changes

Run this migration to fix all FK constraints:

```bash
npx sequelize-cli db:migrate --name 20251201000001-fix-foreign-key-constraints.js
```

Or apply the SQL directly (see `fix-foreign-key-constraints.sql`)

---

## Summary Table

| Parent Table | Child Table | onDelete | Reason |
|--------------|-------------|----------|---------|
| states | districts | RESTRICT | Master data |
| states | cities | RESTRICT | Master data |
| states | listings | RESTRICT | Master data |
| cities | listings | RESTRICT | Master data |
| categories | listings | RESTRICT | Master data |
| roles | users | SET NULL | Keep user if role deleted |
| users | user_profiles | CASCADE | Delete with user |
| users | user_sessions | CASCADE | Delete with user |
| users | user_social_accounts | CASCADE | Delete with user |
| users | user_subscriptions | SET NULL | Keep billing history |
| users | listings | CASCADE | Delete with user |
| users | chat_rooms (buyer/seller) | CASCADE | Delete with user |
| users | listing_offers (buyer/seller) | CASCADE | Delete with user |
| listings | car_listings | CASCADE | Delete with listing |
| listings | property_listings | CASCADE | Delete with listing |
| listings | listing_media | CASCADE | Delete with listing |
| listings | data_requests | CASCADE | Delete with listing |
| listings | chat_rooms | CASCADE | Delete with listing |
| chat_rooms | chat_messages | CASCADE | Delete with chat |
| chat_rooms | listing_offers | CASCADE | Delete with chat |
| roles | role_permissions | CASCADE | Junction table |
| permissions | role_permissions | CASCADE | Junction table |

---

## Testing Deletion Scenarios

### Test 1: Delete User
```sql
-- Soft delete user
UPDATE users SET deleted_at = NOW(), status = 'deleted' WHERE id = 123;

-- Should CASCADE delete:
-- ✓ user_profiles
-- ✓ user_sessions  
-- ✓ user_social_accounts
-- ✓ listings (and all listing-related data)

-- Should SET NULL:
-- ✓ user_subscriptions.user_id

-- Should CASCADE delete:
-- ✓ chat_rooms (where user is buyer or seller)
-- ✓ listing_offers (where user is buyer or seller)
-- ✓ chat_messages (via chat_rooms cascade)
```

### Test 2: Delete State (Should Fail)
```sql
-- Should FAIL if cities exist
DELETE FROM states WHERE id = 1;
-- ERROR: update or delete on table "states" violates foreign key constraint
```

### Test 3: Delete Listing
```sql
-- Should CASCADE delete all related data
DELETE FROM listings WHERE id = 456;

-- Should CASCADE delete:
-- ✓ car_listings/property_listings
-- ✓ listing_media
-- ✓ data_requests
-- ✓ chat_rooms (and their messages/offers)
```

---

## Important Notes

1. **Always use soft delete for users** - Never hard delete from users table
2. **Reference data should never be deleted** - Use `is_active: false` instead
3. **Test in development first** - Verify cascade behavior before production
4. **Backup before migration** - This migration changes critical FK constraints
5. **Monitor orphaned records** - Run cleanup queries periodically to check for data integrity

---

## Cleanup Queries

Check for orphaned records after migration:

```sql
-- Check for listings without users (should be none after fix)
SELECT COUNT(*) FROM listings WHERE user_id NOT IN (SELECT id FROM users);

-- Check for cities without states (should be none)
SELECT COUNT(*) FROM cities WHERE state_id NOT IN (SELECT id FROM states);

-- Check for subscriptions with deleted users (expected - SET NULL)
SELECT COUNT(*) FROM user_subscriptions WHERE user_id IS NULL;

-- Check for orphaned chats (should be none after fix)
SELECT COUNT(*) FROM chat_rooms WHERE buyer_id NOT IN (SELECT id FROM users) OR seller_id NOT IN (SELECT id FROM users);
```
