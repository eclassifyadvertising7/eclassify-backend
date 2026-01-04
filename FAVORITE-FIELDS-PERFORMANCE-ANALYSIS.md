# Favorite Fields Performance Analysis

## Current Implementation

### Fields Being Calculated

1. **`favoriteCount`** - Total number of users who favorited this listing
2. **`isFavorited`** - Whether the current user has favorited this listing

### How They Are Calculated

#### 1. `favoriteCount` Calculation

**Location:** `src/repositories/listingRepository.js`

**Current Implementation (N+1 Query Problem):**
```javascript
// In getAll() method - LIST ENDPOINT
const listingsWithFavorites = await Promise.all(
  rows.map(async (listing) => {
    const favoriteCount = await UserFavorite.count({
      where: { listingId: listing.id }
    });
    
    listing.dataValues.favoriteCount = favoriteCount;
    return listing;
  })
);
```

**Problem:** 
- If you fetch 20 listings, this executes **20 separate COUNT queries**
- Classic **N+1 query problem**
- Each query: `SELECT COUNT(*) FROM user_favorites WHERE listing_id = ?`

**Performance Impact:**
- 20 listings = 20 COUNT queries = ~20-100ms (depending on DB)
- 100 listings = 100 COUNT queries = ~100-500ms
- **VERY EXPENSIVE** for list endpoints

#### 2. `isFavorited` Calculation

**Location:** `src/repositories/listingRepository.js` → `addIsFavoritedField()`

**Current Implementation (OPTIMIZED):**
```javascript
async addIsFavoritedField(listings, userId = null) {
  if (!userId || !listings || listings.length === 0) {
    return listings.map(listing => {
      listing.dataValues.isFavorited = false;
      return listing;
    });
  }

  // Get all listing IDs
  const listingIds = listings.map(listing => listing.id);

  // Single query to get all favorites
  const userFavorites = await UserFavorite.findAll({
    where: {
      userId,
      listingId: { [Op.in]: listingIds }
    },
    attributes: ['listingId']
  });

  // Create a Set for O(1) lookup
  const favoritedListingIds = new Set(userFavorites.map(fav => fav.listingId));

  // Add isFavorited field
  return listings.map(listing => {
    listing.dataValues.isFavorited = favoritedListingIds.has(listing.id);
    return listing;
  });
}
```

**Performance:**
- **1 query** for all listings (regardless of count)
- Query: `SELECT listing_id FROM user_favorites WHERE user_id = ? AND listing_id IN (?, ?, ...)`
- **WELL OPTIMIZED** - No N+1 problem

---

## Performance Analysis

### Current Performance Issues

| Field | Method | Queries | Performance | Issue |
|-------|--------|---------|-------------|-------|
| `favoriteCount` | N+1 queries | 1 per listing | ❌ **VERY BAD** | N+1 problem |
| `isFavorited` | Single query | 1 total | ✅ **GOOD** | Optimized |

### Benchmark Estimates

**For 20 listings:**
- `favoriteCount`: 20 queries × 5ms = **100ms**
- `isFavorited`: 1 query × 5ms = **5ms**
- **Total overhead: ~105ms**

**For 100 listings:**
- `favoriteCount`: 100 queries × 5ms = **500ms**
- `isFavorited`: 1 query × 5ms = **5ms**
- **Total overhead: ~505ms**

---

## Solution: Use Denormalized `total_favorites` Column

### Good News: Column Already Exists!

The `listings` table already has a `total_favorites` column:

```javascript
// migrations/20250314000001-create-listings-table.js
total_favorites: {
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0
}
```

### Recommended Implementation

#### Step 1: Update Listing Model

Ensure the field is mapped in `src/models/Listing.js`:

```javascript
totalFavorites: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  field: 'total_favorites'
}
```

#### Step 2: Update UserFavorite Repository

Add/update methods to increment/decrement the counter:

```javascript
// src/repositories/userFavoriteRepository.js

async addFavorite(userId, listingId) {
  const transaction = await sequelize.transaction();
  
  try {
    // Create favorite
    const favorite = await UserFavorite.create(
      { userId, listingId },
      { transaction }
    );
    
    // Increment counter
    await Listing.increment('totalFavorites', {
      where: { id: listingId },
      transaction
    });
    
    await transaction.commit();
    return favorite;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async removeFavorite(userId, listingId) {
  const transaction = await sequelize.transaction();
  
  try {
    // Delete favorite
    await UserFavorite.destroy({
      where: { userId, listingId },
      transaction
    });
    
    // Decrement counter (don't go below 0)
    await Listing.decrement('totalFavorites', {
      where: { 
        id: listingId,
        totalFavorites: { [Op.gt]: 0 }
      },
      transaction
    });
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

#### Step 3: Remove N+1 Queries from Repository

Update `src/repositories/listingRepository.js`:

```javascript
// REMOVE THIS:
const listingsWithFavorites = await Promise.all(
  rows.map(async (listing) => {
    const favoriteCount = await UserFavorite.count({
      where: { listingId: listing.id }
    });
    
    listing.dataValues.favoriteCount = favoriteCount;
    return listing;
  })
);

// REPLACE WITH:
// Just use the denormalized field - it's already in the listing object!
// No additional queries needed!
```

The `totalFavorites` field will already be in the listing data from the main query.

#### Step 4: Update Detail Endpoints

For detail endpoints, you can optionally verify the count is accurate:

```javascript
// Optional: Only for detail endpoints if you want to ensure accuracy
if (listing && options.includeAll) {
  // Use denormalized value (already in listing)
  listing.dataValues.favoriteCount = listing.totalFavorites;
  
  // Optional: Verify accuracy (only in detail view)
  // const actualCount = await UserFavorite.count({ where: { listingId: id } });
  // if (actualCount !== listing.totalFavorites) {
  //   await listing.update({ totalFavorites: actualCount });
  //   listing.dataValues.favoriteCount = actualCount;
  // }
}
```

---

## Performance Improvement

### Before (Current):
- **20 listings**: 20 COUNT queries = ~100ms
- **100 listings**: 100 COUNT queries = ~500ms

### After (Using Denormalized Field):
- **20 listings**: 0 additional queries = **0ms**
- **100 listings**: 0 additional queries = **0ms**

### Improvement:
- ✅ **100% elimination** of N+1 queries
- ✅ **100ms-500ms faster** response times
- ✅ **Zero additional database load**

---

## Data Consistency Strategy

### When to Update `total_favorites`

1. **User adds favorite**: Increment counter
2. **User removes favorite**: Decrement counter
3. **Periodic sync job** (optional): Verify accuracy

### Handling Race Conditions

Use **database transactions** to ensure atomicity:

```javascript
// Both operations in same transaction
BEGIN TRANSACTION;
  INSERT INTO user_favorites (user_id, listing_id) VALUES (?, ?);
  UPDATE listings SET total_favorites = total_favorites + 1 WHERE id = ?;
COMMIT;
```

### Handling Counter Drift

Add a periodic sync job (optional):

```javascript
// Run daily/weekly to fix any drift
async syncFavoriteCounts() {
  const listings = await Listing.findAll({
    attributes: ['id', 'totalFavorites']
  });
  
  for (const listing of listings) {
    const actualCount = await UserFavorite.count({
      where: { listingId: listing.id }
    });
    
    if (actualCount !== listing.totalFavorites) {
      await listing.update({ totalFavorites: actualCount });
    }
  }
}
```

---

## Migration Plan

### Phase 1: Sync Existing Data

Create a migration to populate `total_favorites` for existing listings:

```javascript
// migrations/YYYYMMDDHHMMSS-sync-favorite-counts.js
export async function up(queryInterface, Sequelize) {
  // Update all listings with correct favorite counts
  await queryInterface.sequelize.query(`
    UPDATE listings
    SET total_favorites = (
      SELECT COUNT(*)
      FROM user_favorites
      WHERE user_favorites.listing_id = listings.id
    )
  `);
}

export async function down(queryInterface, Sequelize) {
  // Reset to 0
  await queryInterface.sequelize.query(`
    UPDATE listings SET total_favorites = 0
  `);
}
```

### Phase 2: Update Application Code

1. Update `userFavoriteRepository.js` to increment/decrement counter
2. Remove N+1 queries from `listingRepository.js`
3. Use `totalFavorites` field directly

### Phase 3: Test

1. Test favorite add/remove updates counter
2. Test list endpoints return correct counts
3. Test detail endpoints return correct counts
4. Load test to verify performance improvement

---

## Summary

### Current State:
- ❌ `favoriteCount`: **N+1 query problem** (very expensive)
- ✅ `isFavorited`: **Optimized** (single query)

### Recommended Solution:
- ✅ Use existing `total_favorites` denormalized column
- ✅ Update counter on favorite add/remove
- ✅ Eliminate all N+1 queries
- ✅ **100ms-500ms faster** response times

### Implementation Priority:
- 🔴 **HIGH PRIORITY** - Significant performance impact on list endpoints
- 🟢 **LOW EFFORT** - Column already exists, simple code changes
- 🟢 **LOW RISK** - Can verify with periodic sync job

### Next Steps:
1. Run migration to sync existing counts
2. Update `userFavoriteRepository.js` to maintain counter
3. Remove N+1 queries from `listingRepository.js`
4. Test and deploy
