# Subscription System Changes - Quota-Based Implementation

## Overview
Implementing quota-based subscription system with category-specific plans (Cars/Properties), rolling quotas for free users, and feature-based expiry for paid plans.

## Database Schema Changes

### 1. Users Table - Remove Obsolete Columns & Add Premium Tier
**File:** `migrations/20250121000001-create-users-table.js` 
**Model:** `src/models/User.js`

**Remove obsolete columns:**
```sql
-- These columns become meaningless with category-specific subscriptions
DROP COLUMN subscription_type,
DROP COLUMN subscription_expires_at
```

**Add new column:**
```sql
-- Premium tier for personal boost subscriptions (performance cache)
premium_tier VARCHAR(20) NULL DEFAULT NULL
```

**Affected model fields:**
- **Remove:** `subscriptionType` - User can be free in one category, paid in another
- **Remove:** `subscriptionExpiresAt` - Expiry is now per-category subscription
- **Add:** `premiumTier` - Cached premium subscription tier (lite, standard, pro, vip)

### 2. Subscription Plans Table
**File:** `migrations/20250309000001-create-subscription-plans-table.js`
**Model:** `src/models/SubscriptionPlan.js`

**Modify existing columns:**
```sql
-- Make category_id nullable to support personal boost plans (premium subscriptions)
ALTER COLUMN category_id DROP NOT NULL
```

**Add new columns:**
```sql
-- New flags for plan types
is_free_plan BOOLEAN NOT NULL DEFAULT false,
is_quota_based BOOLEAN NOT NULL DEFAULT true
```

**Plan Types:**
- **Category-specific plans:** Cars, Properties (category_id = specific category)
- **Personal boost plans:** Premium subscriptions (category_id = NULL)

### 3. User Subscriptions Table  
**File:** `migrations/20250311000001-create-user-subscriptions-table.js`
**Model:** `src/models/UserSubscription.js`

**Remove unnecessary columns:**
```sql
-- Remove duplicate start date (keep only activated_at)
DROP COLUMN starts_at,

-- Remove feature expiry columns (calculate dynamically)
-- These will be calculated as: activated_at + feature_days from plan
-- No need to store in database
```

**Note:** Feature expiry dates will be calculated dynamically in service layer:
```javascript
const boostExpiresAt = new Date(subscription.activatedAt);
boostExpiresAt.setDate(boostExpiresAt.getDate() + subscription.boostedDays);
```

### 4. Listings Table
**File:** `migrations/[existing-listings-migration].js`
**Model:** `src/models/Listing.js`

**Add new columns:**
```sql
-- Subscription tracking
user_subscription_id BIGINT NULL REFERENCES user_subscriptions(id),
is_paid_listing BOOLEAN NOT NULL DEFAULT false
```

## Business Logic Implementation

### Quota Service
**New File:** `src/services/quotaService.js`
**Repository:** `src/repositories/quotaRepository.js`

**Responsibilities:**
- Rolling 30-day quota calculation for free plans
- Total quota tracking for paid plans  
- Quota exhaustion detection and plan conversion
- Feature expiry management

**Key Methods:**
- `checkQuotaAvailability(userId, categoryId)`
- `consumeQuota(userId, subscriptionId)`
- `convertToFreePlan(userId, categoryId)`
- `calculateFeatureExpiry(subscription, featureType)`

### Listing Service Updates
**File:** `src/services/listingService.js`
**Repository:** `src/repositories/listingRepository.js`

**Enhanced Flow:**
1. Check quota before listing submission
2. If quota exceeded → save as draft status
3. If quota available → submit for approval if is_auto_approve_enabled = false in users table (super admin approve listings)
4. Set `user_subscription_id` and `is_paid_listing` flags
5. Approve listing of users who have is_auto_approve_enabled = true in users table, Consume quota immediately

### Subscription Service Updates
**File:** `src/services/subscriptionService.js`
**Repository:** `src/repositories/subscriptionRepository.js`

**New Features:**
- Multiple category subscription management
- Auto-conversion from paid to free plans
- Feature expiry tracking
- Registration auto-assignment of free plans

### Controllers
**Files to Update:**
- `src/controllers/end-user/subscriptionController.js`
- `src/controllers/end-user/listingController.js`
- `src/controllers/panel/subscriptionController.js`

## Implementation Rules

### Free Plans
- **Duration:** 25 years (9125 days) - effectively permanent
- **Quota:** Rolling 30-day window
- **Quota Calculation:** Count listings with status IN ('pending', 'approved', 'active', 'sold') in last 30 days
- **Reset:** No reset needed, always rolling window
- **Assignment:** Auto-assigned on user registration

### Paid Plans  
- **Duration:** 25 years (but quota-based expiry)
- **Quota:** Total listings allowed (`max_total_listings`)
- **Expiry:** When quota exhausted, not time-based
- **Conversion:** Auto-convert to free plan when quota exhausted
- **Features:** Time-based expiry independent of plan expiry

### Multiple Subscriptions
- **Rule:** One active subscription per category per user
- **Categories:** Cars and Properties can have separate subscriptions
- **Constraint:** Update unique index in user_subscriptions table

### Quota Consumption Rules
- **What Counts:** Listings with status: 'pending', 'approved', 'active', 'sold'
- **What Doesn't Count:** 'draft', 'rejected', 'expired' listings
- **Timing:** Quota consumed immediately when listing submitted for approval
- **Tracking:** Via `user_subscription_id` in listings table

### Feature Expiry Management
- **Calculation:** `activated_at + feature_days` from subscription plan
- **Independence:** Each feature expires separately
- **Immediate Expiry:** All features expire when plan converts to free
- **Types:** boost, spotlight, homepage, featured

## Migration Strategy

### Phase 1: Database Updates
1. Add new columns to existing tables
2. Update models with new fields
3. Create indexes for performance optimization

### Phase 2: Service Layer
1. Implement quota service
2. Update listing service with quota checks
3. Enhance subscription service with multi-category support

### Phase 3: Controller Updates
1. Update listing creation endpoints
2. Add quota checking endpoints
3. Implement subscription management endpoints

### Phase 4: Seeder Updates
**File:** `seeders/20250311000001-seed-subscription-plans.js`
- Add free plans for Cars and Properties categories
- Update existing plans with new flags
- Set appropriate quota limits

## Files Requiring Updates

### Database Files
- `migrations/20250121000001-create-users-table.js` ✅ **COMPLETED** (removed obsolete columns)
- `migrations/20250309000001-create-subscription-plans-table.js` ✅ **COMPLETED** (added new flags)
- `migrations/20250311000001-create-user-subscriptions-table.js` ✅ **COMPLETED** (removed starts_at, updated unique constraint)
- `migrations/20250314000001-create-listings-table.js` ✅ **COMPLETED** (updated with subscription tracking)
- `seeders/20250311000001-seed-subscription-plans.js` ✅ **COMPLETED** (dynamic category-specific plans, free plans, personal boost)

### Model Files
- `src/models/User.js` ✅ **COMPLETED** (removed obsolete subscription fields)
- `src/models/SubscriptionPlan.js` ✅ **COMPLETED** (added new flags)
- `src/models/UserSubscription.js` ✅ **COMPLETED** (removed startsAt field)
- `src/models/Listing.js` ✅ **COMPLETED** (added subscription tracking fields)

### Service Files
- `src/services/quotaService.js` ✅ **COMPLETED** (rolling quotas, consumption tracking, plan conversion)
- `src/services/subscriptionService.js` ✅ **COMPLETED** (updated with category-specific methods, free plan auto-assignment, feature expiry tracking)
- `src/services/listingService.js` ✅ **COMPLETED** (integrated quota checks, consumption, eligibility)
- `src/services/featureService.js` ✅ **COMPLETED** (feature expiry management, application, cleanup)

### Repository Files
- `src/repositories/quotaRepository.js` ✅ **COMPLETED** (quota calculations, subscription tracking)
- `src/repositories/subscriptionRepository.js` ✅ **COMPLETED** (updated with category-specific methods, free plan queries)
- `src/repositories/featureRepository.js` ✅ **COMPLETED** (feature tracking, usage stats, expiry management)
- `src/repositories/listingRepository.js` (pending - next phase)

### Controller Files
- `src/controllers/end-user/subscriptionController.js` ✅ **COMPLETED**
- `src/controllers/end-user/listingController.js` (pending - next phase)
- `src/controllers/panel/subscriptionController.js` ✅ **COMPLETED**
- `src/controllers/public/subscriptionPlanController.js` ✅ **COMPLETED**

### Route Files
- `src/routes/end-user/subscriptionRoutes.js` ✅ **COMPLETED** (added category-specific endpoints)
- `src/routes/panel/subscriptionRoutes.js` ✅ **COMPLETED** (added category filtering endpoint)
- `src/routes/public/subscriptionPlanRoutes.js` ✅ **COMPLETED** (added category endpoint)

## Key Performance Considerations

### Database Indexes
```sql
-- For quota calculations
CREATE INDEX idx_listings_quota_check ON listings(user_id, category_id, status, created_at);

-- For subscription lookups
CREATE INDEX idx_user_subscriptions_category ON user_subscriptions(user_id, plan_id, status);
```

### Quota Query Optimization
- Use composite indexes for rolling quota calculations
- Consider caching frequently accessed quota counts
- Optimize listing status filtering

## Implementation Status

### ✅ **PHASE 1 COMPLETED - Subscription Plans & Controllers**
- **Database:** Users table updated, Subscription Plans table updated
- **Models:** User and SubscriptionPlan models updated with new structure
- **Repository:** Enhanced with category-specific methods and filtering
- **Service:** Updated with category-specific subscription logic
- **Controllers:** All three types (Public, End-User, Admin) updated with new endpoints
- **API Documentation:** Complete API documentation created (`API-Docs/subscription-system.md`)

### ✅ **PHASE 2A COMPLETED - User Subscriptions Table Updates**
- User Subscriptions table updates (remove unnecessary columns) ✅ **COMPLETED**
- User Subscriptions model updates ✅ **COMPLETED**
- Service layer updates for removed fields ✅ **COMPLETED**

### ✅ **PHASE 2B COMPLETED - Listings Integration & Quota System**
- ✅ Listings table updates (add subscription tracking) **COMPLETED**
- ✅ Quota service implementation **COMPLETED**
- ✅ Listing service integration with quota system **COMPLETED**
- ✅ Feature expiry management **COMPLETED**
- ✅ Seeder updates for new plan structure **COMPLETED**

### 📋 **Next Steps:**
1. ✅ ~~Update User Subscriptions table and model~~ **COMPLETED**
2. Update Listings table and model with subscription tracking
3. Implement quota service for rolling quotas and consumption tracking
4. Update listing service with quota checks and draft handling
5. Update seeders with new subscription plan structure

## Notes
- Auto-approval related columns remain unchanged (not part of this implementation)
- Existing listings remain active regardless of plan changes
- No soft deletes on user_subscriptions to maintain audit trail
- Feature expiry is independent of plan quota expiry