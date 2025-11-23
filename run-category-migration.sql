-- Run this SQL to create categories table manually
-- Migration: 20250301000001-create-categories-table

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    image_url VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by JSON,
    deleted_by BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_is_featured ON categories(is_featured);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Seed initial categories
INSERT INTO categories (name, slug, description, display_order, is_featured, is_active, created_at, updated_at)
VALUES 
    ('Cars', 'cars', 'Buy and sell new and used cars', 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Properties', 'properties', 'Buy, sell, and rent properties', 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify
SELECT * FROM categories;
