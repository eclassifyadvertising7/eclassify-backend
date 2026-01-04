# Scoring Integration Summary

## Overview

Integrated `scoringHelper.js` across all public listing endpoints to provide consistent, intelligent sorting with multi-level tiebreakers.

## Affected Endpoints

All endpoints now use scoring mechanism:

1. **Browse all listings** - `GET /api/public/listings`
2. **Category page** - `GET /api/public/listings/category/:categorySlugOrId`
3. **Featured listings** - `GET /api/public/listings/featured`
4. **Related listings** - `GET /api/public/listings/related/:id`
5. **Search listings** - `GET /api/public/listings/search`

## Sorting Priority

### Relevance Sort (`sortBy=relevance`)
```
1. Total Score (PRIMARY)
2. ID (tiebreaker)
```

### Other Sorts (views, price, date, favorites)
```
1. User-selected field (PRIMARY)
2. Total Score (SECONDARY - tiebreaker)
3. ID (TERTIARY - final tiebreaker)
```

### Examples

**Views Sort:**
```sql
ORDER BY view_count DESC, total_score DESC, id DESC
```

**Price Low Sort:**
```sql
ORDER BY price ASC, total_score DESC, id ASC
```

**Date New Sort:**
```sql
ORDER BY created_at DESC, total_score DESC, id DESC
```

## Score Components

Total score calculated from:

1. **Location Score (0-50 points)**
   - Same city: 50 points
   - Same state: 25 points
   - Multiplied by location source confidence (0.3-1.0)

2. **Paid Listing Score (0-30 points)**
   - Paid listing: 30 points

3. **Featured Score (0-20 points)**
   - Featured (active): 20 points

4. **Freshness Score (0-10 points)**
   - ≤1 day: 10 points
   - ≤7 days: 7 points
   - ≤30 days: 5 points

**Maximum possible score: 110 points**

## Implementation Details

### Modified Files

1. **`src/utils/scoringHelper.js`**
   - Added `sortListingsWithPrimary()` method
   - Handles multi-level sorting for all sort types

2. **`src/utils/searchHelper.js`**
   - Updated `buildSearchOrder()` to add ID tiebreakers
   - Simplified ORDER BY clauses (scoring done in-memory)

3. **`src/repositories/listingRepository.js`**
   - `getAll()`: Always calculates scores, applies `sortListingsWithPrimary()`
   - `searchListings()`: Always applies score-based secondary sorting
   - `findRelatedListings()`: Added total score as secondary tiebreaker

### Key Changes

**Before:**
- Scoring only applied for `sortBy=relevance`
- No consistent tiebreakers
- Featured/fresh listings not prioritized in ties

**After:**
- Scoring always calculated and applied
- Consistent multi-level tiebreakers (primary → score → ID)
- Featured/fresh listings naturally rank higher in ties
- Deterministic ordering (ID as final tiebreaker)

## Benefits

✅ **Better UX**: Featured and fresh listings appear first when other values are equal
✅ **Consistent**: Same scoring logic across all endpoints
✅ **Deterministic**: ID tiebreaker ensures stable pagination
✅ **Flexible**: Works with any sort option (views, price, date, etc.)
✅ **Location-aware**: User location influences tiebreaker ranking

## Usage Example

```javascript
// User sorts by views
GET /api/public/listings?sortBy=views

// Response: Listings sorted by:
// 1. view_count DESC (primary)
// 2. totalScore DESC (secondary - featured/fresh listings win ties)
// 3. id DESC (tertiary - stable ordering)
```

## Performance Notes

- **Fetches ALL records** matching filters for accurate scoring across all pages
- In-memory sorting after score calculation
- Pagination applied after sorting (slice from sorted results)
- **Important**: For large datasets (1000+ listings), consider:
  - Adding database indexes on frequently filtered columns
  - Implementing result caching for popular queries
  - Using database-level scoring for better performance

## Testing Recommendations

1. Test with listings having same view counts
2. Verify featured listings appear first in ties
3. **Check pagination works correctly for all pages (especially page 3+)**
4. Test with/without user location
5. Verify all sort options work correctly
6. Test with large datasets (100+ listings)
