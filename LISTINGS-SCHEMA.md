# Listings & Categories Schema

## Overview

This document defines the database schema for the listings module, supporting multiple category types (cars, properties) with category-specific attributes.

**Design Pattern**: Base table + Category-specific tables (Polymorphic association)

---

## Tables

### 1. categories

Small lookup table for listing categories.

**Columns:**
- `id` INT PRIMARY KEY AUTO_INCREMENT
- `name` VARCHAR(100) NOT NULL UNIQUE
- `slug` VARCHAR(100) NOT NULL UNIQUE
- `description` TEXT
- `icon` VARCHAR(255)
- `image_url` VARCHAR(255)
- `display_order` INT DEFAULT 0
- `is_featured` BOOLEAN DEFAULT true
- `is_active` BOOLEAN DEFAULT true
- `created_by` BIGINT FK → users.id (nullable)
- `updated_by` JSON (nullable) - [{userId, userName, timestamp}]
- `deleted_by` BIGINT FK → users.id (nullable)
- `deleted_at` TIMESTAMP (nullable)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**Seed Data:**
- Cars (slug: 'cars')
- Properties (slug: 'properties')

**Model Hooks:**
- `beforeUpdate`: Append update history to `updated_by` JSON array

---

### 2. listings

High-volume table storing common fields for all listing types.

**Columns:**

**Basic Info:**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `user_id` BIGINT NOT NULL FK → users.id
- `category_id` INT NOT NULL FK → categories.id
- `title` VARCHAR(200) NOT NULL
- `slug` VARCHAR(250) NOT NULL UNIQUE
- `description` TEXT NOT NULL
- `price` DECIMAL(15,2) NOT NULL
- `price_negotiable` BOOLEAN DEFAULT false

**Location:**
- `state_id` INT NOT NULL FK → states.id
- `city_id` INT NOT NULL FK → cities.id
- `locality` VARCHAR(200) nullable
- `address` TEXT
- `latitude` nullable
- `longitude` nullable

**Status & Lifecycle:**
- `status` ENUM('draft', 'pending', 'active', 'expired', 'sold', 'rejected') DEFAULT 'draft'
- `is_featured` BOOLEAN DEFAULT false
- `featured_until` TIMESTAMP (nullable)
- `expires_at` TIMESTAMP (nullable) - 30 days from approval
- `published_at` TIMESTAMP (nullable)

**Moderation:**
- `approved_at` TIMESTAMP (nullable)
- `approved_by` BIGINT FK → users.id (nullable)
- `rejected_at` TIMESTAMP (nullable)
- `rejected_by` BIGINT FK → users.id (nullable)
- `rejection_reason` TEXT (nullable)

**Engagement:**
- `view_count` INT DEFAULT 0
- `contact_count` INT DEFAULT 0

**Audit:**
- `created_by` BIGINT FK → users.id (nullable)
- `updated_by` BIGINT FK → users.id (nullable) - last updater only
- `deleted_by` BIGINT FK → users.id (nullable)
- `deleted_at` TIMESTAMP (nullable)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**Indexes:**
- `idx_user_id` (user_id)
- `idx_category_id` (category_id)
- `idx_status` (status)
- `idx_state_city` (state_id, city_id)
- `idx_expires_at` (expires_at)
- `idx_slug` (slug)
- `idx_featured` (is_featured, featured_until)

**Relationships:**
- belongsTo: User, Category, State, City
- hasOne: CarListing, PropertyListing
- hasMany: ListingMedia

**Model Hooks:**
- `beforeCreate`: Generate unique slug from title
- `beforeUpdate`: Update `updated_by` with userId
- `beforeDestroy`: Soft delete associated media

---

### 3. car_listings

High-volume table storing car-specific attributes.

**Columns:**

**Basic Info:**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `listing_id` BIGINT NOT NULL UNIQUE FK → listings.id ON DELETE CASCADE
- `brand_id` INT NOT NULL FK → car_brands.id
- `model_id` INT NOT NULL FK → car_models.id
- `variant_id` INT FK → car_variants.id (nullable)
- `year` INT NOT NULL
- `registration_year` INT (nullable)

**Condition & Usage:**
- `condition` ENUM('new', 'used') DEFAULT 'used'
- `mileage_km` INT (nullable) - for used cars
- `owners_count` INT DEFAULT 1

**Technical Specs:**
- `fuel_type` ENUM('petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid')
- `transmission` ENUM('manual', 'automatic', 'semi-automatic')
- `body_type` ENUM('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'van', 'truck')
- `color` VARCHAR(50)
- `engine_capacity_cc` INT (nullable)
- `power_bhp` INT (nullable)
- `seats` INT DEFAULT 5

**Registration & Documents:**
- `registration_number` VARCHAR(20) (nullable)
- `registration_state_id` INT FK → states.id (nullable)
- `vin_number` VARCHAR(17) (nullable)
- `insurance_valid_until` TIMESTAMP (nullable)

**Features:**
- `features` JSONB (nullable)
  - Example: `["ABS", "Airbags", "Sunroof", "Leather Seats", "Parking Sensors"]`

**Audit:**
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**Indexes:**
- `idx_listing_id` (listing_id)
- `idx_brand_model` (brand_id, model_id)
- `idx_year` (year)
- `idx_fuel_transmission` (fuel_type, transmission)

**Relationships:**
- belongsTo: Listing, CarBrand, CarModel, CarVariant, State (registration)

---

### 4. property_listings

High-volume table storing property-specific attributes.

**Columns:**

**Property Type:**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `listing_id` BIGINT NOT NULL UNIQUE FK → listings.id ON DELETE CASCADE
- `property_type` ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse')
- `listing_type` ENUM('sale', 'rent')

**Size & Layout:**
- `bedrooms` INT (nullable) - NULL for plots/commercial
- `bathrooms` INT (nullable)
- `balconies` INT DEFAULT 0
- `area_sqft` INT NOT NULL
- `plot_area_sqft` INT (nullable) - for houses/villas
- `carpet_area_sqft` INT (nullable)

**Building Details:**
- `floor_number` INT (nullable)
- `total_floors` INT (nullable)
- `age_years` INT (nullable)
- `facing` ENUM('north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west') (nullable)

**Amenities & Features:**
- `furnished` ENUM('unfurnished', 'semi-furnished', 'fully-furnished')
- `parking_spaces` INT DEFAULT 0
- `amenities` JSONB (nullable)
  - Example: `["gym", "pool", "security", "power-backup", "lift", "garden", "club-house"]`

**Rent Specific (nullable for sale):**
- `monthly_rent` DECIMAL(15,2) (nullable)
- `security_deposit` DECIMAL(15,2) (nullable)
- `maintenance_monthly` DECIMAL(10,2) (nullable)
- `available_from` DATE (nullable)

**Legal:**
- `ownership_type` ENUM('freehold', 'leasehold', 'co-operative') (nullable)
- `rera_approved` BOOLEAN DEFAULT false
- `rera_id` VARCHAR(50) (nullable)

**Audit:**
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**Indexes:**
- `idx_listing_id` (listing_id)
- `idx_property_type` (property_type)
- `idx_listing_type` (listing_type)
- `idx_bedrooms` (bedrooms)
- `idx_area` (area_sqft)

**Relationships:**
- belongsTo: Listing

---

### 5. listing_media

High-volume table storing images and videos for listings.

**Columns:**

**Basic Info:**
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `listing_id` BIGINT NOT NULL FK → listings.id ON DELETE CASCADE

**Media Details:**
- `media_type` ENUM('image', 'video') DEFAULT 'image'
- `media_url` VARCHAR(500) NOT NULL - full size/original
- `thumbnail_url` VARCHAR(500) NOT NULL - thumbnail for both images & videos
- `file_size_bytes` INT NOT NULL
- `width` INT (nullable) - for images
- `height` INT (nullable) - for images
- `duration_seconds` INT (nullable) - for videos

**Display:**
- `display_order` INT DEFAULT 0
- `is_primary` BOOLEAN DEFAULT false - only ONE per listing

**Storage Metadata:**
- `storage_type` ENUM('local', 'cloudinary', 's3') DEFAULT 'local'
- `storage_path` VARCHAR(500) (nullable) - original path/key

**Audit:**
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**Indexes:**
- `idx_listing_id` (listing_id)
- `idx_media_type` (media_type)
- `idx_is_primary` (listing_id, is_primary)
- `idx_display_order` (listing_id, display_order)

**Constraints:**
- UNIQUE (listing_id, display_order)
- Only one `is_primary = true` per listing

**Relationships:**
- belongsTo: Listing

**Model Hooks:**
- `beforeCreate`: Auto-generate thumbnail for videos
- `beforeDestroy`: Delete files from storage (local/cloudinary/s3)

---

## Relationships Summary

```
users (1) ──→ (N) listings
categories (1) ──→ (N) listings
states (1) ──→ (N) listings
cities (1) ──→ (N) listings

listings (1) ──→ (1) car_listings
listings (1) ──→ (1) property_listings
listings (1) ──→ (N) listing_media

car_brands (1) ──→ (N) car_listings
car_models (1) ──→ (N) car_listings
car_variants (1) ──→ (N) car_listings
states (1) ──→ (N) car_listings (registration_state_id)
```

---

## Business Rules

### Listing Lifecycle

1. **Draft**: User creates listing, not visible publicly
2. **Pending**: User submits for approval
3. **Active**: Admin approves, listing goes live
   - `expires_at` = `approved_at` + 30 days
   - `published_at` = current timestamp
4. **Expired**: Auto-expires after 30 days
5. **Sold**: User marks as sold
6. **Rejected**: Admin rejects with reason

### Media Rules

- **Images**: Max 15 per listing
  - Formats: JPG, PNG, WebP
  - Max size: 5MB each
  - Auto-compress and generate thumbnails
- **Videos**: Max 3 per listing
  - Formats: MP4, MOV
  - Max size: 50MB each
  - Max duration: 60 seconds
  - Auto-generate video thumbnails
- **Primary Media**: Only ONE `is_primary = true` per listing
  - Shows on listing cards and search results
  - If video, show video thumbnail

### Slug Generation

- Format: `{title-kebab-case}-{unique-id}`
- Example: `toyota-camry-2020-abc123`
- Auto-generated on create
- Unique constraint enforced

### Featured Listings

- `is_featured = true` with `featured_until` timestamp
- Featured listings appear at top of search results
- Auto-expire when `featured_until` passes
- Managed by subscription plans or admin

### Soft Deletes

- Listings use `deleted_at` + `deleted_by`
- Cascade soft delete to `listing_media`
- Preserve data for analytics and recovery

### Validation Rules

**Cars:**
- `year` must be between 1900 and current year + 1
- `mileage_km` required if `condition = 'used'`
- `registration_year` <= `year`

**Properties:**
- `bedrooms`, `bathrooms` required for residential types
- `monthly_rent`, `security_deposit` required if `listing_type = 'rent'`
- `area_sqft` > 0

---

## Query Patterns

### Get All Active Listings (Any Category)
```sql
SELECT * FROM listings 
WHERE status = 'active' 
  AND expires_at > NOW() 
  AND deleted_at IS NULL
ORDER BY is_featured DESC, created_at DESC;
```

### Get Car Listings with Details
```sql
SELECT l.*, cl.*, cb.name as brand_name, cm.name as model_name
FROM listings l
INNER JOIN car_listings cl ON l.id = cl.listing_id
INNER JOIN car_brands cb ON cl.brand_id = cb.id
INNER JOIN car_models cm ON cl.model_id = cm.id
WHERE l.status = 'active' AND l.category_id = 1;
```

### Get Listing with Primary Media
```sql
SELECT l.*, lm.media_url, lm.thumbnail_url
FROM listings l
LEFT JOIN listing_media lm ON l.id = lm.listing_id AND lm.is_primary = true
WHERE l.id = ?;
```

### Search Cars by Filters
```sql
SELECT l.*, cl.*
FROM listings l
INNER JOIN car_listings cl ON l.id = cl.listing_id
WHERE l.status = 'active'
  AND l.price BETWEEN ? AND ?
  AND cl.brand_id = ?
  AND cl.fuel_type = ?
  AND cl.year >= ?
ORDER BY l.created_at DESC;
```

---

## Future Enhancements

### Phase 2: flexi_listings

For dynamic categories (electronics, furniture, etc.):

```sql
flexi_listings
├── id BIGINT PRIMARY KEY
├── listing_id BIGINT FK → listings.id
├── attributes JSONB - fully dynamic attributes
└── timestamps
```

### Additional Features

- **Favorites**: `user_favorites` table (user_id, listing_id)
- **Reports**: `listing_reports` table (reporter_id, listing_id, reason)
- **Views Tracking**: `listing_views` table (user_id, listing_id, viewed_at)
- **Price History**: `listing_price_history` table (listing_id, old_price, new_price, changed_at)
- **Listing Boosts**: Premium feature to boost visibility
- **Comparison**: Allow users to compare multiple listings

---

## Migration Strategy

1. Create `categories` table and seed data
2. Create `listings` base table
3. Create `car_listings` table
4. Create `property_listings` table
5. Create `listing_media` table
6. Add foreign key constraints
7. Add indexes for performance

**Note**: During development, update migrations directly. In production, create new migrations for schema changes.
