-- Add new columns to subscription_plans table
-- Run these queries directly on your PostgreSQL database

-- Add category_id column with foreign key (NOT NULL)
ALTER TABLE subscription_plans 
ADD COLUMN category_id INTEGER NOT NULL;

ALTER TABLE subscription_plans 
ADD CONSTRAINT fk_subscription_plans_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON UPDATE CASCADE ON DELETE RESTRICT;

COMMENT ON COLUMN subscription_plans.category_id IS 'Plan is restricted to this category';

-- Add category_name column (NOT NULL)
ALTER TABLE subscription_plans 
ADD COLUMN category_name VARCHAR(255) NOT NULL;

COMMENT ON COLUMN subscription_plans.category_name IS 'Cached category name for display';

-- Add state_id column with foreign key (NULLABLE)
ALTER TABLE subscription_plans 
ADD COLUMN state_id INTEGER NULL;

ALTER TABLE subscription_plans 
ADD CONSTRAINT fk_subscription_plans_state_id 
FOREIGN KEY (state_id) REFERENCES states(id) 
ON UPDATE CASCADE ON DELETE SET NULL;

COMMENT ON COLUMN subscription_plans.state_id IS 'Optional - If set, plan is restricted to this state only';

-- Add city_id column with foreign key (NULLABLE)
ALTER TABLE subscription_plans 
ADD COLUMN city_id INTEGER NULL;

ALTER TABLE subscription_plans 
ADD CONSTRAINT fk_subscription_plans_city_id 
FOREIGN KEY (city_id) REFERENCES cities(id) 
ON UPDATE CASCADE ON DELETE SET NULL;

COMMENT ON COLUMN subscription_plans.city_id IS 'Optional - If set, plan is restricted to this city only';

-- Create indexes for better query performance
CREATE INDEX idx_subscription_plans_category_id ON subscription_plans(category_id);
CREATE INDEX idx_subscription_plans_state_id ON subscription_plans(state_id);
CREATE INDEX idx_subscription_plans_city_id ON subscription_plans(city_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name IN ('category_id', 'category_name', 'state_id', 'city_id')
ORDER BY ordinal_position;
