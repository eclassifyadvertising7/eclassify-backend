# Subscription Plans Schema Update

## Summary
Added category and location restriction columns to the `subscription_plans` table to enable category-specific and location-specific subscription plans.

## Changes Made

### New Columns Added

1. **category_id** (INTEGER, NOT NULL)
   - Foreign key to `categories(id)`
   - ON DELETE RESTRICT (cannot delete category if plans exist)
   - Every subscription plan must be tied to a specific category
   - Indexed for performance

2. **category_name** (VARCHAR(255), NOT NULL)
   - Cached category name for display purposes
   - Denormalized for performance (avoids JOIN on every query)
   - Should be updated when category name changes

3. **state_id** (INTEGER, NULLABLE)
   - Foreign key to `states(id)`
   - ON DELETE SET NULL
   - Optional - when NULL, plan is available nationally
   - When set, plan is restricted to that specific state
   - Indexed for performance

4. **city_id** (INTEGER, NULLABLE)
   - Foreign key to `cities(id)`
   - ON DELETE SET NULL
   - Optional - when NULL, plan is available state-wide or nationally
   - When set, plan is restricted to that specific city
   - Indexed for performance

## Use Cases

### Category-Specific Plans
Every plan must belong to a category (e.g., "Cars", "Properties"):
- "Premium Car Listing Plan" → category_id = 1 (Cars)
- "Featured Property Plan" → category_id = 2 (Properties)

### Location-Based Plans

1. **National Plans** (default)
   - state_id = NULL, city_id = NULL
   - Available across all states and cities

2. **State-Specific Plans**
   - state_id = 5 (Maharashtra), city_id = NULL
   - Available only in Maharashtra state

3. **City-Specific Plans**
   - state_id = 5 (Maharashtra), city_id = 42 (Mumbai)
   - Available only in Mumbai city

## Files Updated

1. **migrations/20250210000001-create-subscription-plans-table.js**
   - Added 4 new columns with proper constraints and indexes
   - Added foreign key relationships

2. **src/models/SubscriptionPlan.js**
   - Added model fields with proper mappings
   - Added associations to Category, State, and City models

3. **DATABASE-SCHEMA.md**
   - Updated subscription_plans table documentation
   - Added new columns, relationships, and usage notes

4. **ALTER-subscription-plans.sql**
   - SQL queries to add columns to existing database
   - Includes foreign keys, indexes, and comments

## Database Migration

### For New Installations
Just run migrations normally:
```bash
npx sequelize-cli db:migrate
```

### For Existing Databases
Run the ALTER queries:
```bash
psql -U your_username -d your_database -f ALTER-subscription-plans.sql
```

Or execute manually:
```sql
-- Add category_id (NOT NULL)
ALTER TABLE subscription_plans ADD COLUMN category_id INTEGER NOT NULL;
ALTER TABLE subscription_plans ADD CONSTRAINT fk_subscription_plans_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Add category_name (NOT NULL)
ALTER TABLE subscription_plans ADD COLUMN category_name VARCHAR(255) NOT NULL;

-- Add state_id (NULLABLE)
ALTER TABLE subscription_plans ADD COLUMN state_id INTEGER NULL;
ALTER TABLE subscription_plans ADD CONSTRAINT fk_subscription_plans_state_id 
FOREIGN KEY (state_id) REFERENCES states(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Add city_id (NULLABLE)
ALTER TABLE subscription_plans ADD COLUMN city_id INTEGER NULL;
ALTER TABLE subscription_plans ADD CONSTRAINT fk_subscription_plans_city_id 
FOREIGN KEY (city_id) REFERENCES cities(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_subscription_plans_category_id ON subscription_plans(category_id);
CREATE INDEX idx_subscription_plans_state_id ON subscription_plans(state_id);
CREATE INDEX idx_subscription_plans_city_id ON subscription_plans(city_id);
```

## Important Notes

1. **Mandatory Category**: Every plan MUST have a category_id and category_name
2. **Optional Location**: state_id and city_id are optional for location restrictions
3. **Denormalization**: category_name is cached - update it when category name changes
4. **Delete Protection**: Cannot delete a category if subscription plans reference it (RESTRICT)
5. **Cascading**: If state/city is deleted, plans become national (SET NULL)

## Next Steps

1. Update seeder files to include category_id and category_name
2. Update subscription plan creation/update services to handle new fields
3. Update API endpoints to filter plans by category and location
4. Update frontend to display category-specific and location-specific plans
