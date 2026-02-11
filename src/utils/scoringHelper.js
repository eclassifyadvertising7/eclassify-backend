import scoringLogger from '#utils/loggers/scoringLogger.js';

class ScoringHelper {
  static calculateLocationScore(userLocation, listingLocation, distance_km = null) {
    if (distance_km !== null && distance_km !== undefined) {
      let score = 0;
      if (distance_km <= 5) score = 50;
      else if (distance_km <= 10) score = 45;
      else if (distance_km <= 25) score = 40;
      else if (distance_km <= 50) score = 30;
      else if (distance_km <= 100) score = 20;
      else if (distance_km <= 200) score = 10;
      else score = 0;
      
      return score;
    }

    return 0;
  }

  static calculatePaidListingScore(isPaidListing) {
    return isPaidListing ? 30 : 0;
  }

  static calculateFeaturedScore(isFeatured, featuredUntil) {
    if (!isFeatured) return 0;
    
    if (featuredUntil && new Date() > new Date(featuredUntil)) {
      return 0;
    }

    return 20;
  }

  static calculateFreshnessScore(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) return 10;
    if (daysDiff <= 7) return 7;
    if (daysDiff <= 30) return 5;
    return 0;
  }

  static calculateTotalScore(listingData, context = {}) {
    const {
      stateId,
      cityId,
      latitude,
      longitude,
      isPaidListing = false,
      isFeatured = false,
      featuredUntil = null,
      createdAt,
      created_at,
      distance_km
    } = listingData;

    const { userLocation = null, requestId = null } = context;

    const timestamp = createdAt || created_at;
    
    if (!timestamp) {
      throw new Error('createdAt is required for scoring');
    }

    const scores = {
      location: this.calculateLocationScore(
        userLocation, 
        { stateId, cityId, latitude, longitude },
        distance_km
      ),
      paid: this.calculatePaidListingScore(isPaidListing),
      featured: this.calculateFeaturedScore(isFeatured, featuredUntil),
      freshness: this.calculateFreshnessScore(timestamp)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (requestId) {
      scoringLogger.listingScored(requestId, {
        listingId: listingData.id,
        distance_km: distance_km !== null && distance_km !== undefined ? parseFloat(distance_km).toFixed(2) : 'N/A',
        scores,
        totalScore
      });
    }

    return {
      totalScore,
      breakdown: scores
    };
  }

  static sortListings(listings) {
    return listings.sort((a, b) => {
      const aFeatured = a.isFeatured && (!a.featuredUntil || new Date() <= new Date(a.featuredUntil));
      const bFeatured = b.isFeatured && (!b.featuredUntil || new Date() <= new Date(b.featuredUntil));
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      const scoreComparison = b.totalScore - a.totalScore;
      if (scoreComparison !== 0) return scoreComparison;
      
      const aDistance = a.distance_km !== undefined && a.distance_km !== null ? a.distance_km : Infinity;
      const bDistance = b.distance_km !== undefined && b.distance_km !== null ? b.distance_km : Infinity;
      const distanceComparison = aDistance - bDistance;
      if (distanceComparison !== 0) return distanceComparison;
      
      return b.id - a.id;
    });
  }

  static sortListingsWithPrimary(listings, sortBy = 'relevance', requestId = null) {
    const sorted = listings.sort((a, b) => {
      let primaryComparison = 0;

      switch (sortBy) {
        case 'relevance':
          primaryComparison = (b.totalScore || 0) - (a.totalScore || 0);
          if (primaryComparison !== 0) return primaryComparison;
          
          const aDistance = a.distance_km !== undefined && a.distance_km !== null ? a.distance_km : Infinity;
          const bDistance = b.distance_km !== undefined && b.distance_km !== null ? b.distance_km : Infinity;
          const distanceComparison = aDistance - bDistance;
          if (distanceComparison !== 0) return distanceComparison;
          
          return b.id - a.id;

        case 'views':
          primaryComparison = (b.viewCount || 0) - (a.viewCount || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'favorites':
          primaryComparison = (b.totalFavorites || 0) - (a.totalFavorites || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'price_low':
        case 'price_asc':
          primaryComparison = (a.price || 0) - (b.price || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'price_high':
        case 'price_desc':
          primaryComparison = (b.price || 0) - (a.price || 0);
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'date_new':
        case 'date_desc':
          const aDate = new Date(a.createdAt || a.created_at || 0);
          const bDate = new Date(b.createdAt || b.created_at || 0);
          primaryComparison = bDate - aDate;
          if (primaryComparison !== 0) return primaryComparison;
          break;

        case 'date_old':
        case 'date_asc':
          const aDateOld = new Date(a.createdAt || a.created_at || 0);
          const bDateOld = new Date(b.createdAt || b.created_at || 0);
          primaryComparison = aDateOld - bDateOld;
          if (primaryComparison !== 0) return primaryComparison;
          break;

        default:
          primaryComparison = (b.totalScore || 0) - (a.totalScore || 0);
          if (primaryComparison !== 0) return primaryComparison;
          
          const aDistDef = a.distance_km !== undefined && a.distance_km !== null ? a.distance_km : Infinity;
          const bDistDef = b.distance_km !== undefined && b.distance_km !== null ? b.distance_km : Infinity;
          const distCompDef = aDistDef - bDistDef;
          if (distCompDef !== 0) return distCompDef;
          
          return b.id - a.id;
      }

      const scoreComparison = (b.totalScore || 0) - (a.totalScore || 0);
      if (scoreComparison !== 0) return scoreComparison;

      const aDistFallback = a.distance_km !== undefined && a.distance_km !== null ? a.distance_km : Infinity;
      const bDistFallback = b.distance_km !== undefined && b.distance_km !== null ? b.distance_km : Infinity;
      const distCompFallback = aDistFallback - bDistFallback;
      if (distCompFallback !== 0) return distCompFallback;

      return b.id - a.id;
    });

    if (requestId && sorted.length > 0) {
      const scores = sorted.map(l => l.totalScore || 0);
      const topScore = Math.max(...scores);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      
      scoringLogger.sortingApplied(requestId, {
        sortBy,
        listingsCount: sorted.length,
        topScore: topScore.toFixed(0),
        avgScore: avgScore.toFixed(1)
      });
    }

    return sorted;
  }

  static calculateSimilarityScore(listing, referenceListing) {
    let score = 0;

    if (listing.categoryId === referenceListing.categoryId) {
      score += 40;
    }

    const priceRatio = Math.min(listing.price, referenceListing.price) / 
                       Math.max(listing.price, referenceListing.price);
    if (priceRatio >= 0.7) {
      score += 30 * priceRatio;
    }

    if (listing.cityId === referenceListing.cityId) {
      score += 20;
    } else if (listing.stateId === referenceListing.stateId) {
      score += 10;
    }

    if (listing.postedByType === referenceListing.postedByType) {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  }
}

export default ScoringHelper;
