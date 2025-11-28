-- Run this SQL to create the data_requests table

CREATE TABLE data_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('brand', 'model', 'variant', 'state', 'city')),
  brand_name VARCHAR(100),
  model_name VARCHAR(100),
  variant_name VARCHAR(150),
  state_name VARCHAR(100),
  city_name VARCHAR(100),
  additional_details TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_brand_id INTEGER REFERENCES car_brands(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_model_id INTEGER REFERENCES car_models(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_variant_id INTEGER REFERENCES car_variants(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_state_id INTEGER REFERENCES states(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_city_id INTEGER REFERENCES cities(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_data_requests_user_id ON data_requests(user_id);
CREATE INDEX idx_data_requests_status ON data_requests(status);
CREATE INDEX idx_data_requests_request_type ON data_requests(request_type);
CREATE INDEX idx_data_requests_reviewed_by ON data_requests(reviewed_by);
CREATE INDEX idx_data_requests_created_at ON data_requests(created_at);

-- Add to SequelizeMeta table to track migration
INSERT INTO "SequelizeMeta" (name) VALUES ('20250330000001-create-data-requests-table.js');
