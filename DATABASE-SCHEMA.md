# Database Schema Reference

Quick reference for all database tables, columns, relationships, and hooks.

## Tables

### states
**Columns:** id (INT PK), slug (VARCHAR UNIQUE), name (VARCHAR), region_slug (VARCHAR), region_name (VARCHAR), is_active (BOOLEAN), display_order (INT), created_by (INT), updated_by (JSON), is_deleted (BOOLEAN), deleted_by (INT), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- hasMany → cities (via state_id)
- hasMany → users (via state_id)
- hasMany → listings (via state_id)

**Hooks:**
- beforeCreate: Auto-generate slug from name
- beforeUpdate: Auto-update slug if name changes

---

### cities
**Columns:** id (INT PK), slug (VARCHAR(255) UNIQUE), name (VARCHAR(255)), state_id (INT FK→states), state_name (VARCHAR(255)), latitude (DECIMAL(10,8)), longitude (DECIMAL(11,8)), is_active (BOOLEAN), display_order (INT), created_by (INT), updated_by (JSON - array of {userId, userName, timestamp}), is_deleted (BOOLEAN), deleted_by (INT), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- belongsTo → states (via state_id)
- hasMany → users (via city_id)
- hasMany → listings (via city_id)

**Hooks:**
- beforeCreate: Auto-generate slug from name
- beforeUpdate: Auto-update slug if name changes

**Constraints:** FK state_id RESTRICT on delete

**Config:** paranoid: false

**Indexes:** slug, state_id, (state_id, is_active)

**Notes:** Small lookup table; latitude/longitude for map features; display_order for sorting within state

---

### roles
**Columns:** id (INT PK), name (VARCHAR(50) UNIQUE), slug (VARCHAR(50) UNIQUE), description (TEXT), priority (SMALLINT), is_system_role (BOOLEAN), is_active (BOOLEAN), created_by (BIGINT FK→users), updated_by (JSON - array of {userId, userName, timestamp}), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- hasMany → users (via role_id)
- belongsToMany → permissions (through role_permissions)

**Hooks:**
- beforeDestroy: Prevent deletion if is_system_role = true
- beforeUpdate: Auto-append update history to updated_by JSON array

**Config:** paranoid: true (soft delete)

---

### permissions
**Columns:** id (INT PK), name (VARCHAR(100) UNIQUE), slug (VARCHAR(100) UNIQUE), resource (VARCHAR(50)), action (VARCHAR(50)), description (TEXT), is_active (BOOLEAN), created_by (BIGINT FK→users), updated_by (JSON - array of {userId, userName, timestamp}), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- belongsToMany → roles (through role_permissions)

**Hooks:**
- beforeCreate: Auto-generate slug from resource.action if not provided
- beforeUpdate: Update slug if resource or action changes, auto-append update history to updated_by JSON array

**Config:** paranoid: true (soft delete)

---

### role_permissions
**Columns:** id (BIGINT PK), role_id (INT FK→roles), permission_id (INT FK→permissions), created_at (TIMESTAMP), updated_at (TIMESTAMP)

**Relationships:**
- belongsTo → roles (via role_id)
- belongsTo → permissions (via permission_id)

**Constraints:** UNIQUE(role_id, permission_id)

**Config:** paranoid: false (no soft delete)

---

### users
**Columns:** id (BIGINT PK), country_code (VARCHAR(5)), mobile (VARCHAR(15) UNIQUE), full_name (VARCHAR(150)), email (VARCHAR(150) UNIQUE), password_hash (TEXT), role_id (INT FK→roles), status (ENUM), is_active (BOOLEAN), is_password_reset (BOOLEAN), is_phone_verified (BOOLEAN), is_email_verified (BOOLEAN), phone_verified_at (TIMESTAMP), email_verified_at (TIMESTAMP), last_login_at (TIMESTAMP), kyc_status (ENUM), profile_photo (TEXT), subscription_type (ENUM), subscription_expires_at (TIMESTAMP), max_devices (SMALLINT), created_by (BIGINT FK→users), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- belongsTo → roles (via role_id)
- hasOne → user_profiles (via user_id)
- hasMany → user_sessions (via user_id)
- hasMany → user_social_accounts (via user_id)
- belongsTo → users (self-reference via created_by)
- belongsTo → users (self-reference via deleted_by)

**Hooks:**
- beforeCreate: Hash password with bcrypt (salt rounds: 10)
- beforeUpdate: Hash password if changed
- beforeDestroy: Set status = 'deleted', set deleted_by

**Config:** paranoid: true (soft delete)

---

### user_profiles
**Columns:** id (BIGINT PK), user_id (BIGINT UNIQUE FK→users), dob (DATE), gender (VARCHAR(10)), about (TEXT), name_on_id (VARCHAR(150)), business_name (VARCHAR(200)), gstin (VARCHAR(15)), aadhar_number (VARCHAR(12)), pan_number (VARCHAR(10)), address_line1 (TEXT), address_line2 (TEXT), city (VARCHAR(100)), state_id (INT FK→states), state_name (VARCHAR(255)), country (VARCHAR(50)), pincode (VARCHAR(10)), latitude (DECIMAL(10,8)), longitude (DECIMAL(11,8)), created_at (TIMESTAMP), updated_at (TIMESTAMP)

**Relationships:**
- belongsTo → users (via user_id)
- belongsTo → states (via state_id)

**Hooks:** None

**Config:** paranoid: false

**Notes:** state_name is denormalized for performance; aadhar_number and pan_number should be hashed at application level

---

### user_sessions
**Columns:** id (BIGINT PK), user_id (BIGINT FK→users), refresh_token_hash (TEXT), fcm_token (TEXT), device_id (VARCHAR(200)), device_name (VARCHAR(200)), user_agent (TEXT), ip_address_v4 (VARCHAR(15)), ip_address_v6 (VARCHAR(45)), login_method (VARCHAR(20)), is_active (BOOLEAN), last_active (TIMESTAMP), expires_at (TIMESTAMP), created_at (TIMESTAMP), updated_at (TIMESTAMP)

**Relationships:**
- belongsTo → users (via user_id)

**Hooks:** None

**Config:** paranoid: false

**Notes:** refresh_token_hash stores HASHED token only; login_method values: 'password', 'google', 'facebook', 'otp'

---

### user_social_accounts
**Columns:** id (BIGINT PK), user_id (BIGINT FK→users), provider (VARCHAR(30)), provider_id (VARCHAR(200)), email (VARCHAR(150)), profile_picture_url (TEXT), is_primary (BOOLEAN), access_token (TEXT), refresh_token (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)

**Relationships:**
- belongsTo → users (via user_id)

**Hooks:** None

**Constraints:** UNIQUE(provider, provider_id)

**Config:** paranoid: false

**Notes:** provider values: 'google', 'facebook', 'apple'

---

### subscription_plans
**Columns:** id (INT PK), plan_code (VARCHAR(50) UNIQUE), version (INT), name (VARCHAR(255)), slug (VARCHAR(100) UNIQUE), description (TEXT), short_description (VARCHAR(500)), base_price (DECIMAL(10,2)), discount_amount (DECIMAL(10,2)), final_price (DECIMAL(10,2)), currency (VARCHAR(3)), billing_cycle (ENUM), duration_days (INT), tagline (VARCHAR(255)), show_original_price (BOOLEAN), show_offer_badge (BOOLEAN), offer_badge_text (VARCHAR(50)), sort_order (INT), max_total_listings (INT), max_active_listings (INT), listing_quota_limit (INT), listing_quota_rolling_days (INT), max_featured_listings (INT), max_boosted_listings (INT), max_spotlight_listings (INT), max_homepage_listings (INT), featured_days (INT), boosted_days (INT), spotlight_days (INT), priority_score (INT), search_boost_multiplier (DECIMAL(5,2)), recommendation_boost_multiplier (DECIMAL(5,2)), cross_city_visibility (BOOLEAN), national_visibility (BOOLEAN), auto_renewal (BOOLEAN), max_renewals (INT), listing_duration_days (INT), auto_refresh_enabled (BOOLEAN), refresh_frequency_days (INT), manual_refresh_per_cycle (INT), support_level (ENUM), features (JSON), available_addons (JSON), upsell_suggestions (JSON), metadata (JSON), internal_notes (TEXT), terms_and_conditions (TEXT), is_active (BOOLEAN), is_public (BOOLEAN), is_default (BOOLEAN), is_featured (BOOLEAN), is_system_plan (BOOLEAN), deprecated_at (TIMESTAMP), replaced_by_plan_id (INT FK→subscription_plans), created_by (BIGINT FK→users), updated_by (JSON), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- belongsTo → subscription_plans (self-reference via replaced_by_plan_id)
- belongsTo → users (via created_by)
- belongsTo → users (via deleted_by)

**Hooks:**
- beforeUpdate: Auto-append update history to updated_by JSON array
- beforeDestroy: Prevent deletion if is_system_plan = true

**Config:** paranoid: true (soft delete)

**Notes:** Small lookup table (~10-20 plans); features column stores less-critical flags (see SUBSCRIPTION-PLANS-FEATURES.md); billing_cycle values: 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one_time'; support_level values: 'none', 'standard', 'priority', 'dedicated'; listing_quota_limit and listing_quota_rolling_days implement rolling window quota (e.g., 10 listings per 30 rolling days)

---

### user_subscriptions
**Columns:** id (BIGINT PK), user_id (BIGINT FK→users), plan_id (INT FK→subscription_plans), starts_at (TIMESTAMP), ends_at (TIMESTAMP), activated_at (TIMESTAMP), status (ENUM), is_trial (BOOLEAN), trial_ends_at (TIMESTAMP), auto_renew (BOOLEAN), cancelled_at (TIMESTAMP), cancellation_reason (TEXT), renewal_reminder_sent (BOOLEAN), expiry_reminder_sent (BOOLEAN), plan_name (VARCHAR(255)), plan_code (VARCHAR(50)), plan_version (INT), base_price (DECIMAL(10,2)), discount_amount (DECIMAL(10,2)), final_price (DECIMAL(10,2)), currency (VARCHAR(3)), billing_cycle (VARCHAR(20)), duration_days (INT), max_total_listings (INT), max_active_listings (INT), listing_quota_limit (INT), listing_quota_rolling_days (INT), max_featured_listings (INT), max_boosted_listings (INT), max_spotlight_listings (INT), max_homepage_listings (INT), featured_days (INT), boosted_days (INT), spotlight_days (INT), priority_score (INT), search_boost_multiplier (DECIMAL(5,2)), recommendation_boost_multiplier (DECIMAL(5,2)), cross_city_visibility (BOOLEAN), national_visibility (BOOLEAN), auto_renewal_enabled (BOOLEAN), max_renewals (INT), listing_duration_days (INT), auto_refresh_enabled (BOOLEAN), refresh_frequency_days (INT), manual_refresh_per_cycle (INT), support_level (VARCHAR(20)), features (JSON), invoice_id (BIGINT FK→invoices), payment_method (VARCHAR(50)), transaction_id (VARCHAR(255)), amount_paid (DECIMAL(10,2)), previous_subscription_id (BIGINT FK→user_subscriptions), is_upgrade (BOOLEAN), is_downgrade (BOOLEAN), proration_credit (DECIMAL(10,2)), metadata (JSON), notes (TEXT), created_by (BIGINT FK→users), updated_by (BIGINT), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- belongsTo → users (via user_id)
- belongsTo → subscription_plans (via plan_id)
- belongsTo → user_subscriptions (self-reference via previous_subscription_id)
- belongsTo → users (via created_by)
- belongsTo → users (via deleted_by)

**Hooks:** None

**Constraints:** UNIQUE(user_id, status) WHERE status='active' AND deleted_at IS NULL (only one active subscription per user)

**Config:** paranoid: true (soft delete)

**Notes:** High-volume table (BIGINT PK); snapshots all plan benefits at purchase time for immutability; status values: 'pending', 'active', 'expired', 'cancelled', 'suspended'; plan_id is for reference only, never use for checking user benefits (use snapshot fields instead)

---

### car_brands
**Columns:** id (INT PK), name (VARCHAR(100) UNIQUE), slug (VARCHAR(100) UNIQUE), name_local (VARCHAR(100)), logo_url (VARCHAR(500)), description (TEXT), country_of_origin (VARCHAR(50)), display_order (INT), is_popular (BOOLEAN), is_active (BOOLEAN), is_featured (BOOLEAN), meta_title (VARCHAR(200)), meta_description (VARCHAR(500)), meta_keywords (VARCHAR(500)), total_models (INT), total_listings (INT), total_views (BIGINT), created_by (BIGINT FK→users), updated_by (JSON - array of {userId, userName, timestamp}), deleted_by (BIGINT FK→users), created_at (TIMESTAMP), updated_at (TIMESTAMP), deleted_at (TIMESTAMP)

**Relationships:**
- hasMany → car_models (via brand_id)
- hasMany → listings (via car_brand_id)
- belongsTo → users (via created_by)
- belongsTo → users (via deleted_by)

**Hooks:**
- beforeUpdate: Auto-append update history to updated_by JSON array

**Config:** paranoid: true (soft delete)

**Indexes:** slug, (is_active, display_order), is_popular, deleted_at

**Notes:** Small lookup table (~60 brands); total_models, total_listings, total_views are denormalized counters updated via background jobs; display_order allows manual sorting (popular brands first)

---

### listings
**Columns:** TBD

**Relationships:**
- belongsTo → states (via state_id)
- belongsTo → car_brands (via car_brand_id)

**Hooks:** TBD

---

## Foreign Key Constraints & Circular Dependencies

### Issue
During initial migration, some foreign key constraints were intentionally omitted to avoid circular dependencies:
- `roles.created_by` → users (roles created before users)
- `roles.deleted_by` → users
- `permissions.created_by` → users (permissions created before users)
- `permissions.deleted_by` → users
- `user_subscriptions.invoice_id` → invoices (invoices table not yet created)

### Resolution
A dedicated migration (`20251230000001-add-audit-foreign-keys.js`) adds these constraints back after all dependent tables exist.

### Guidelines for Future Migrations
1. **Identify circular dependencies** before creating migrations
2. **Create tables in dependency order** (parent tables first)
3. **Omit problematic FK constraints** in initial table creation
4. **Document omitted constraints** in migration comments
5. **Create a follow-up migration** to add constraints after all tables exist
6. **Run the constraint migration** after initial setup is complete

### Running the Constraint Migration
```bash
# After all initial migrations are complete
npx sequelize-cli db:migrate --to 20251230000001-add-audit-foreign-keys.js
```

### Checking Missing Constraints
```sql
-- Check if constraints exist
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('roles', 'permissions', 'user_subscriptions');
```

## Notes
- Use INTEGER for small lookup tables (< 2B records)
- Use BIGINT for high-volume tables (users, listings, messages, etc.)
- Foreign keys must match parent table ID type
- All tables use snake_case naming
- Timestamps: created_at, updated_at (auto-managed by Sequelize)
- Audit fields (created_by, deleted_by) should reference users table when possible
