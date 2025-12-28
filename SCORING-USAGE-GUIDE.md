# Scoring Helper - Usage Guide

## Quick Start

```javascript
import ScoringHelper from '#utils/scoringHelper.js';
```

## Basic Usage

### 1. Calculate Total Score

```javascript
// With Sequelize model
const listing = await Listing.findByPk(123);
const scoreResult = ScoringHelper.calculateTotalScore(listing, {
  userLocation: { stateId: 1, cityId: 10 }
});

console.log(scoreResult);
// {
//   totalScore: 85,
//   breakdown: {
//     location: 50,
//     paid: 30,
//     featured: 0,
//     freshness: 5
//   }
// }
```

### 2. Calculate Individual Scores

```javascript
// Location score
const locationScore = ScoringHelper.calculateLocationScore(
  { stateId: 1, cityId: 10, source: 'user_preferred' },
  { stateId: 1, cityId: 10 }
);
// Returns: 50

// Paid listing score
const paidScore = ScoringHelper.calculatePaidListingScore(true);
// Returns: 30

// Featured score
const featuredScore = ScoringHelper.calculateFeaturedScore(
  true,
  new Date('2025-12-31')
);
// Returns: 20

// Freshness score
const freshnessScore = ScoringHelper.calculateFreshnessScore(
  new Date()
);
// Returns: 10
```

### 3. Sort Listings (Two-Tier)

```javascript
const listings = [
  { id: 1, isFeatured: false, totalScore: 90 },
  { id: 2, isFeatured: true, totalScore: 45 },
  { id: 3, isFeatured: true, totalScore: 30 },
  { id: 4, isFeatured: false, totalScore: 75 }
];

const sorted = ScoringHelper.sortListings(listings);

// Result order:
// [
//   { id: 2, isFeatured: true, totalScore: 45 },  ← Featured first
//   { id: 3, isFeatured: true, totalScore: 30 },  ← Featured second
//   { id: 1, isFeatured: false, totalScore: 90 }, ← Non-featured (highest score)
//   { id: 4, isFeatured: false, totalScore: 75 }  ← Non-featured
// ]
```

### 4. Calculate Similarity Score

```javascript
const currentListing = {
  categoryId: 1,
  price: 850000,
  stateId: 1,
  cityId: 10,
  postedByType: 'owner'
};

const otherListing = {
  categoryId: 1,
  price: 900000,
  stateId: 1,
  cityId: 10,
  postedByType: 'owner'
};

const similarityScore = ScoringHelper.calculateSimilarityScore(
  otherListing,
  currentListing
);
// Returns: 100 (perfect match)
```

## Use Cases

### Homepage Listings

```javascript
async getHomepageListings(userLocation = null) {
  const listings = await Listing.findAll({ ... });

  const scoredListings = listings.map(listing => {
    const scoreResult = ScoringHelper.calculateTotalScore(listing, {
      userLocation
    });

    return {
      ...listing.toJSON(),
      totalScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown
    };
  });

  // Sort with featured priority
  return ScoringHelper.sortListings(scoredListings);
}
```

### Search Results

```javascript
async searchListings(searchParams, userLocation, userId) {
  const listings = await Listing.findAll({ ... });

  const scoredListings = listings.map(listing => {
    const scoreResult = ScoringHelper.calculateTotalScore(listing, {
      userLocation
    });

    return {
      ...listing.toJSON(),
      totalScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown
    };
  });

  // Sort by relevance (featured first, then by score)
  if (sortBy === 'relevance') {
    return ScoringHelper.sortListings(scoredListings);
  }

  return scoredListings;
}
```

### Related Listings

```javascript
async findRelatedListings(listingId, limit = 6) {
  const referenceListing = await Listing.findByPk(listingId);
  const candidates = await Listing.findAll({ ... });

  const scoredListings = candidates.map(listing => {
    const similarityScore = ScoringHelper.calculateSimilarityScore(
      listing,
      referenceListing
    );

    return {
      ...listing.toJSON(),
      similarityScore
    };
  });

  // Sort by similarity
  scoredListings.sort((a, b) => b.similarityScore - a.similarityScore);

  return scoredListings.slice(0, limit);
}
```

### Category Listings

```javascript
async getCategoryListings(categoryId, userLocation, userId) {
  const listings = await Listing.findAll({
    where: { categoryId, status: 'active' }
  });

  const scoredListings = listings.map(listing => {
    const scoreResult = ScoringHelper.calculateTotalScore(listing, {
      userLocation
    });

    return {
      ...listing.toJSON(),
      totalScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown
    };
  });

  return ScoringHelper.sortListings(scoredListings);
}
```

## Advanced Usage

### Custom Location Source Priority

```javascript
const userLocation = {
  stateId: 1,
  cityId: 10,
  source: 'browser_geolocation' // 90% multiplier
};

const scoreResult = ScoringHelper.calculateTotalScore(listing, {
  userLocation
});

// Location score will be: 50 * 0.9 = 45
```

### Without User Location

```javascript
// No location bonus
const scoreResult = ScoringHelper.calculateTotalScore(listing, {
  userLocation: null
});

// breakdown.location will be 0
```

### With Plain Objects

```javascript
const listingData = {
  stateId: 1,
  cityId: 10,
  isPaidListing: true,
  isFeatured: false,
  featuredUntil: null,
  createdAt: new Date('2024-12-20')
};

const scoreResult = ScoringHelper.calculateTotalScore(listingData, {
  userLocation: { stateId: 1, cityId: 10 }
});
```

## Score Breakdown

### Maximum Possible Scores

| Component | Max Points | Description |
|-----------|-----------|-------------|
| Location | 50 | Same city (with user_preferred source) |
| Paid | 30 | Paid listing |
| Featured | 20 | Featured listing (not expired) |
| Freshness | 10 | Posted in last 24 hours |
| **Total** | **110** | Maximum possible score |

### Location Score Multipliers

| Source | Multiplier | Example Score (Same City) |
|--------|-----------|---------------------------|
| user_preferred | 1.0 | 50 |
| browser_geolocation | 0.9 | 45 |
| user_profile | 0.8 | 40 |
| ip_geolocation | 0.6 | 30 |
| query_params | 0.5 | 25 |
| unknown | 0.3 | 15 |

### Freshness Score Tiers

| Age | Score |
|-----|-------|
| Last 24 hours | 10 |
| Last 7 days | 7 |
| Last 30 days | 5 |
| Older | 0 |

## Two-Tier Sorting Explained

**Tier 1: Featured Status**
- All featured listings (with valid `featuredUntil`) appear first
- Regardless of their total score

**Tier 2: Total Score**
- Within each tier, listings are sorted by `totalScore` (descending)

**Example:**

```
Input:
- Listing A: featured=false, score=95
- Listing B: featured=true, score=40
- Listing C: featured=true, score=60
- Listing D: featured=false, score=80

Output after sortListings():
1. Listing C (featured, score=60)
2. Listing B (featured, score=40)
3. Listing A (not featured, score=95)
4. Listing D (not featured, score=80)
```

## Error Handling

```javascript
try {
  const scoreResult = ScoringHelper.calculateTotalScore(listing, {
    userLocation
  });
} catch (error) {
  // Error: "createdAt is required for scoring"
  console.error(error.message);
}
```

## Performance Tips

1. **Calculate scores in-memory** - No database queries
2. **Batch processing** - Use `map()` for multiple listings
3. **Cache user location** - Don't recalculate for each listing
4. **Lazy scoring** - Only calculate when needed (e.g., relevance sorting)

## Testing

```javascript
// Unit test example
describe('ScoringHelper', () => {
  it('should calculate location score correctly', () => {
    const score = ScoringHelper.calculateLocationScore(
      { stateId: 1, cityId: 10 },
      { stateId: 1, cityId: 10 }
    );
    expect(score).toBe(50);
  });

  it('should prioritize featured listings', () => {
    const listings = [
      { isFeatured: false, totalScore: 100 },
      { isFeatured: true, totalScore: 50 }
    ];
    const sorted = ScoringHelper.sortListings(listings);
    expect(sorted[0].isFeatured).toBe(true);
  });
});
```

## Migration from Old Code

### Before (SearchHelper):

```javascript
const locationScore = SearchHelper.calculateLocationScore(...);
const paidScore = SearchHelper.calculatePaidListingScore(...);
const featuredScore = SearchHelper.calculateFeaturedScore(...);
const freshnessScore = SearchHelper.calculateFreshnessScore(...);
const searchScore = locationScore + paidScore + featuredScore + freshnessScore;
```

### After (ScoringHelper):

```javascript
const scoreResult = ScoringHelper.calculateTotalScore(listing, {
  userLocation
});
// scoreResult.totalScore
// scoreResult.breakdown
```

## Summary

✅ **Simple API** - One function for total score  
✅ **Flexible** - Works with any listing data  
✅ **Fast** - No database queries  
✅ **Transparent** - Score breakdown included  
✅ **Featured priority** - Two-tier sorting built-in  
✅ **Reusable** - Use anywhere in the app

