# Posted By Type - API Response Changes

## Overview
Added `postedByType` field to all listing responses to indicate who posted the listing.

---

## New Field

### postedByType
**Type:** `ENUM('owner', 'agent', 'dealer')`  
**Default:** `'owner'`  
**Description:** Indicates who posted the listing

**Values:**
- `owner` - Posted by the item owner themselves
- `agent` - Posted by an agent/broker on behalf of owner
- `dealer` - Posted by a dealership/business entity

---

## Affected Endpoints

### 1. POST /api/listings (Create Listing)

**Response:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "id": 123,
    "title": "Toyota Camry 2020",
    "price": "1500000.00",
    "status": "draft",
    "postedByType": "owner",
    "createdAt": "2024-11-23T10:30:00.000Z"
  }
}
```

---

### 2. GET /api/listings (List User's Listings)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Toyota Camry 2020",
      "price": "1500000.00",
      "status": "active",
      "postedByType": "owner",
      "viewCount": 45
    }
  ]
}
```

---

### 3. GET /api/panel/listings/:id (Admin View Listing)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Toyota Camry 2020",
    "price": "1500000.00",
    "status": "active",
    "postedByType": "owner",
    "user": {
      "id": 456,
      "fullName": "John Doe"
    }
  }
}
```

---

### 4. GET /api/public/listings (Public Listing Feed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Honda City 2021",
      "price": "650000.00",
      "status": "active",
      "postedByType": "owner",
      "isFeatured": true
    },
    {
      "id": 124,
      "title": "BMW 3 Series 2022",
      "price": "3500000.00",
      "status": "active",
      "postedByType": "dealer",
      "isFeatured": true
    }
  ]
}
```

---

### 5. GET /api/public/listings/:slug (Public Listing Detail)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Honda City 2021",
    "slug": "honda-city-2021-abc123",
    "price": "650000.00",
    "status": "active",
    "postedByType": "agent",
    "description": "Well maintained...",
    "user": {
      "id": 456,
      "fullName": "John Doe"
    }
  }
}
```

---

### 6. GET /api/listings/feed (Personalized Feed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Maruti Swift 2020",
      "price": 850000,
      "status": "active",
      "postedByType": "owner",
      "viewCount": 45
    }
  ]
}
```

---

## Frontend Usage

### Display Badge Based on Type

```javascript
const getBadge = (postedByType) => {
  switch(postedByType) {
    case 'owner':
      return <Badge color="blue">Owner</Badge>;
    case 'agent':
      return <Badge color="green">Agent</Badge>;
    case 'dealer':
      return <Badge color="purple">Authorized Dealer</Badge>;
    default:
      return null;
  }
};

// Usage
<div>
  {listing.postedByType && getBadge(listing.postedByType)}
</div>
```

### Filter by Posted By Type

```javascript
// Filter listings by who posted them
const ownerListings = listings.filter(l => l.postedByType === 'owner');
const dealerListings = listings.filter(l => l.postedByType === 'dealer');

// Show filter UI
<Select>
  <option value="">All Listings</option>
  <option value="owner">Owner Posted</option>
  <option value="agent">Agent Posted</option>
  <option value="dealer">Dealer Posted</option>
</Select>
```

### Trust Indicators

```javascript
// Show different trust levels
const getTrustLevel = (postedByType) => {
  const levels = {
    dealer: { level: 'High', color: 'green', icon: '✓✓✓' },
    agent: { level: 'Medium', color: 'yellow', icon: '✓✓' },
    owner: { level: 'Standard', color: 'blue', icon: '✓' }
  };
  return levels[postedByType] || levels.owner;
};
```

---

## Database Changes

### Migration Applied
```sql
-- Create ENUM type
DO $$ BEGIN
    CREATE TYPE enum_posted_by_type AS ENUM ('owner', 'agent', 'dealer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add column
ALTER TABLE listings 
ADD COLUMN posted_by_type enum_posted_by_type NOT NULL DEFAULT 'owner';

-- Add index for filtering
CREATE INDEX idx_listings_posted_by_type ON listings(posted_by_type);
```

---

## Use Cases

### 1. User Perspective
- See if listing is from owner (direct deal) or agent/dealer
- Trust indicators based on poster type
- Filter to show only owner-posted listings

### 2. Business Logic
- Dealers might get priority in search results
- Agents handle commission offline with owners
- Different contact flows for different poster types

### 3. Analytics
- Track what % of listings are owner vs agent vs dealer
- Conversion rates by poster type
- Popular categories by poster type

---

## Notes

- **Default value:** All existing listings will have `postedByType = 'owner'`
- **Required field:** Cannot be null, must be one of the three values
- **No commission tracking:** Commission is handled offline between parties
- **No agent module:** Agents are regular users who post on behalf of others

---

## Files Updated

- `migrations/20250310000001-create-listings-table.js`
- `src/models/Listing.js`
- `API-Docs/listings.md`
- `API-Docs/public-listings-api.md`
- `API-Docs/listings-feed.md`
- `DATABASE-SCHEMA.md`
- `ALTER_TABLES_POSTED_BY_AND_VERIFIED.sql`
