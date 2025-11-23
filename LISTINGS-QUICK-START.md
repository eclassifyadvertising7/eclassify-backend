# Listings Module - Quick Start Guide

## 🚀 Running the Migrations

### Step 1: Verify Prerequisites
```bash
# Check if required tables exist
psql -d your_database -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'states', 'cities', 'car_brands', 'car_models', 'car_variants');"
```

### Step 2: Run Migrations
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Or run specific migrations
npx sequelize-cli db:migrate --to 20250310000001-create-listings-table.js
npx sequelize-cli db:migrate --to 20250315000001-create-car-listings-table.js
npx sequelize-cli db:migrate --to 20250320000001-create-property-listings-table.js
npx sequelize-cli db:migrate --to 20250325000001-create-listing-media-table.js
```

### Step 3: Verify Tables Created
```bash
# Check tables
psql -d your_database -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('listings', 'car_listings', 'property_listings', 'listing_media');"
```

---

## 📋 Tables Created

1. **listings** - Base table for all listing types
2. **car_listings** - Car-specific attributes (1:1 with listings)
3. **property_listings** - Property-specific attributes (1:1 with listings)
4. **listing_media** - Images and videos for listings

---

## 🔗 Model Relationships

```javascript
// Import models
import models from '#models/index.js';
const { Listing, CarListing, PropertyListing, ListingMedia, Category, User } = models;

// Query with associations
const listing = await Listing.findOne({
  where: { id: 1 },
  include: [
    { model: User, as: 'user' },
    { model: Category, as: 'category' },
    { model: CarListing, as: 'carListing' },
    { model: PropertyListing, as: 'propertyListing' },
    { model: ListingMedia, as: 'media' }
  ]
});
```

---

## 💡 Usage Examples

### Create a Car Listing
```javascript
// Create base listing
const listing = await Listing.create({
  userId: 1,
  categoryId: 1, // Cars category
  title: 'Toyota Camry 2020',
  price: 1500000,
  stateId: 1,
  cityId: 1,
  description: 'Well maintained car',
  status: 'draft'
}, { userId: 1 }); // Pass userId for audit

// Create car-specific data
const carListing = await CarListing.create({
  listingId: listing.id,
  brandId: 1,
  modelId: 1,
  year: 2020,
  fuelType: 'petrol',
  transmission: 'automatic',
  mileageKm: 25000,
  ownersCount: 1
});
```

### Create a Property Listing
```javascript
// Create base listing
const listing = await Listing.create({
  userId: 1,
  categoryId: 2, // Properties category
  title: '3BHK Apartment in Mumbai',
  price: 8500000,
  stateId: 1,
  cityId: 1,
  description: 'Spacious apartment with modern amenities',
  status: 'draft'
}, { userId: 1 });

// Create property-specific data
const propertyListing = await PropertyListing.create({
  listingId: listing.id,
  propertyType: 'apartment',
  listingType: 'sale',
  areaSqft: 1200,
  bedrooms: 3,
  bathrooms: 2,
  furnished: 'semi-furnished',
  amenities: ['gym', 'pool', 'security', 'parking']
});
```

### Upload Media
```javascript
const media = await ListingMedia.create({
  listingId: listing.id,
  mediaType: 'image',
  mediaUrl: '/uploads/listings/2024/11/image1.jpg',
  thumbnailUrl: '/uploads/listings/2024/11/thumb_image1.jpg',
  fileSizeBytes: 1024000,
  width: 1920,
  height: 1080,
  displayOrder: 0,
  isPrimary: true,
  storageType: 'local'
});
```

### Query Active Listings
```javascript
const activeListings = await Listing.findAll({
  where: {
    status: 'active',
    expiresAt: { [Op.gt]: new Date() }
  },
  include: [
    { model: Category, as: 'category' },
    { model: ListingMedia, as: 'media', where: { isPrimary: true }, required: false }
  ],
  order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']]
});
```

### Search Car Listings
```javascript
const carListings = await Listing.findAll({
  where: {
    categoryId: 1, // Cars
    status: 'active',
    price: { [Op.between]: [500000, 2000000] }
  },
  include: [
    {
      model: CarListing,
      as: 'carListing',
      where: {
        brandId: 1,
        fuelType: 'petrol',
        year: { [Op.gte]: 2018 }
      }
    },
    { model: ListingMedia, as: 'media', where: { isPrimary: true }, required: false }
  ]
});
```

---

## 🎯 Key Features

### Slug Generation
- Auto-generated on create: `{title-kebab-case}-{random-6-chars}`
- Example: `toyota-camry-2020-abc123`

### Audit Tracking
```javascript
// Create with audit
await listing.create(data, { userId: req.user.userId });

// Update with audit
await listing.update(data, { userId: req.user.userId });
```

### Soft Delete
```javascript
// Soft delete (sets deleted_at)
await listing.destroy();

// Query without deleted
const listings = await Listing.findAll(); // Excludes deleted

// Query with deleted
const allListings = await Listing.findAll({ paranoid: false });

// Restore deleted
await listing.restore();
```

### Featured Listings
```javascript
// Set as featured
await listing.update({
  isFeatured: true,
  featuredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});

// Query featured listings
const featured = await Listing.findAll({
  where: {
    isFeatured: true,
    featuredUntil: { [Op.gt]: new Date() }
  }
});
```

---

## 🔒 Validation Rules

### Car Listings
- `year`: 1900 to current year + 1
- `mileage_km`: Required if `condition = 'used'`
- `registration_year`: Must be <= `year`

### Property Listings
- `bedrooms`, `bathrooms`: Required for residential types
- `area_sqft`: Must be > 0

### Media
- Images: Max 15 per listing, 5MB each
- Videos: Max 3 per listing, 50MB each, 60s max
- Only ONE `is_primary = true` per listing

---

## 📊 Status Flow

```
draft → pending → active → expired/sold/rejected
                    ↓
              (30 days later)
                    ↓
                 expired
```

---

## 🛠️ Rollback Migrations

```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback specific migration
npx sequelize-cli db:migrate:undo --to 20250325000001-create-listing-media-table.js

# Rollback all
npx sequelize-cli db:migrate:undo:all
```

---

## 📝 Notes

- All fields use camelCase in models, snake_case in database
- Use absolute imports: `import Listing from '#models/Listing.js'`
- Always include `.js` extension in imports (ES6 modules)
- Pass `userId` in options for audit tracking
- Soft delete enabled for listings only (not for car_listings, property_listings, listing_media)

