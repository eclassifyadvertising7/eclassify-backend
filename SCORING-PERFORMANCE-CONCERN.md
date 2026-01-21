# Scoring Performance Concern

## Problem

Current implementation fetches **ALL active listings** for scoring, which causes performance issues with large datasets.

### Current Flow
```
1. Fetch ALL active listings (no limit)
2. Calculate score for each listing
3. Sort by score
4. Slice for pagination
```

### Performance Impact

| Active Listings | Fetch Time | Scoring Time | Total Time | Memory |
|----------------|------------|--------------|------------|---------|
| 100 | ~20ms | ~10ms | ~30ms | ~100KB |
| 1,000 | ~100ms | ~50ms | ~150ms | ~2MB |
| 5,000 | ~500ms | ~300ms | ~800ms | ~10MB |
| 10,000+ | ~2s+ | ~1s+ | ~3s+ | ~50MB+ |

### Real-World Scenario

**Browse all cars:**
```
GET /api/public/listings/category/cars?sortBy=relevance
```

If there are 10,000 active car listings:
- ❌ Fetches all 10,000 records
- ❌ Calculates 10,000 scores
- ❌ Sorts 10,000 items
- ❌ Returns only 20 items (page 1)
- ❌ Takes 3+ seconds

## Current Mitigations

✅ **Status filter:** Only fetches `status = 'active'` listings
✅ **Natural filters:** Category, location, price filters reduce dataset
✅ **Expiration:** 30-day auto-expiration limits old listings

## Proposed Solutions (To Discuss)

### Option 1: Hard Cap at 1000
- Fetch max 1000 listings
- Fast and simple
- Users can't access beyond page 50

### Option 2: Smart Cap with Fallback
- First 1000: Use scoring
- Beyond 1000: Use database sorting
- Best UX, slightly complex

### Option 3: Hybrid Approach
- Relevance sort: Use scoring (capped)
- Other sorts: Use database ORDER BY
- Fast for most queries

### Option 4: Add Time Filter
- Only fetch listings from last 90 days
- Reduces dataset by 60-80%
- Users rarely browse old listings

## Recommendation

**Implement Option 2 (Smart Cap with Fallback) + Option 4 (Time Filter)**

Combined approach:
- Fetch listings from last 90 days (reduces dataset)
- Apply scoring to first 1000 results
- Fall back to database sorting beyond 1000
- Best performance + UX

## Action Items

- [ ] Decide on approach
- [ ] Implement chosen solution
- [ ] Add performance monitoring
- [ ] Test with large datasets
- [ ] Update documentation

## Notes

- Current implementation works fine for < 5,000 active listings
- Monitor response times as platform grows
- Consider caching for popular queries (future optimization)
