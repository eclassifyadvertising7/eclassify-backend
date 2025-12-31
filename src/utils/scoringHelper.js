class ScoringHelper {
  static calculateLocationScore(userLocation, listingLocation) {
    if (!userLocation || !listingLocation) return 0;

    let baseScore = 0;

    if (userLocation.cityId === listingLocation.cityId) {
      baseScore = 50;
    } else if (userLocation.stateId === listingLocation.stateId) {
      baseScore = 25;
    } else {
      baseScore = 0;
    }

    let multiplier = 1.0;
    
    if (userLocation.source) {
      switch (userLocation.source) {
        case 'user_preferred':
          multiplier = 1.0;
          break;
        case 'browser_geolocation':
          multiplier = 0.9;
          break;
        case 'user_profile':
          multiplier = 0.8;
          break;
        case 'ip_geolocation':
          multiplier = 0.6;
          break;
        case 'query_params':
          multiplier = 0.5;
          break;
        default:
          multiplier = 0.3;
      }
    }

    return Math.round(baseScore * multiplier);
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
      isPaidListing = false,
      isFeatured = false,
      featuredUntil = null,
      createdAt,
      created_at // Fallback for snake_case from database
    } = listingData;

    const { userLocation = null } = context;

    // Use createdAt or created_at (fallback)
    const timestamp = createdAt || created_at;
    
    if (!timestamp) {
      throw new Error('createdAt is required for scoring');
    }

    const scores = {
      location: this.calculateLocationScore(userLocation, { stateId, cityId }),
      paid: this.calculatePaidListingScore(isPaidListing),
      featured: this.calculateFeaturedScore(isFeatured, featuredUntil),
      freshness: this.calculateFreshnessScore(timestamp)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

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
      
      return b.totalScore - a.totalScore;
    });
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
