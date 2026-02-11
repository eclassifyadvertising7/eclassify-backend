export async function up(queryInterface, Sequelize) {
  const now = new Date();

  // Get category IDs dynamically
  const [categories] = await queryInterface.sequelize.query(
    "SELECT id, name, slug FROM categories WHERE slug IN ('cars', 'properties')"
  );

  const carsCategory = categories.find((c) => c.slug === 'cars');
  const propertiesCategory = categories.find((c) => c.slug === 'properties');

  if (!carsCategory || !propertiesCategory) {
    throw new Error(
      "Required categories (cars, properties) not found. Please run category seeders first."
    );
  }

  // Define categories and plan tiers
  const categoryConfigs = [
    {
      category: carsCategory,
      categoryType: 'cars',
      freeQuota: { limit: 1, activeListings: 1, price: 0 },
      basicQuota: { total: 15, activeListings: 15, price: 299 },
      standardQuota: { total: 30, activeListings: 30, price: 599 },
      premiumQuota: { total: 50, activeListings: 50, price: 999 },
      testQuota: { total: 3, activeListings: 3, price: 99 }
    },
    {
      category: propertiesCategory,
      categoryType: 'properties',
      freeQuota: { limit: 1, activeListings: 1 },
      basicQuota: { total: 15, activeListings: 15, price: 499 },
      standardQuota: { total: 30, activeListings: 30, price: 899 },
      premiumQuota: { total: 50, activeListings: 50, price: 1499 },
      testQuota: { total: 3, activeListings: 3, price: 149 }
    }
  ];

  // Plan tier configurations
  const planTiers = [
    {
      tier: 'free',
      name: 'Free Plan',
      tagline: 'Start selling for free',
      description: 'Perfect for getting started. Post your first listings and explore the platform.',
      shortDescription: 'Basic features to get you started',
      sortOrder: 1,
      billingCycle: 'one_time',
      durationDays: 9125, // 25 years
      showOriginalPrice: false,
      showOfferBadge: false,
      isDefault: true,
      isPublic: false,
      isFeatured: false,
      isSystemPlan: true,
      isFreePlan: true,
      isQuotaBased: true,
      supportLevel: 'none',
      features: {
        showPhoneNumber: true,
        showWhatsapp: false,
        allowChat: true,
        priorityChatSupport: false,
        analyticsEnabled: false,
        viewCountVisible: false,
        trackLeads: false,
        sellerVerificationIncluded: false,
        trustBadge: false,
        warrantyBadge: false,
        geoTargetingEnabled: false,
        radiusTargetingKm: null,
        socialSharingEnabled: true,
        createPromotions: false,
        autoApproval: false,
        priorityModeration: false,
        appealRejectedListings: true
      },
      visibility: {
        priorityScore: 0,
        searchBoostMultiplier: 1.0,
        recommendationBoostMultiplier: 1.0,
        crossCityVisibility: false,
        nationalVisibility: false
      },
      featuredLimits: {
        maxFeaturedListings: 0,
        maxBoostedListings: 0,
        maxSpotlightListings: 0,
        maxHomepageListings: 0,
        featuredDays: 0,
        boostedDays: 0,
        spotlightDays: 0
      }
    },
    {
      tier: 'basic',
      name: 'Basic Plan',
      tagline: 'Best for regular sellers',
      description: 'Ideal for regular sellers. Get more listings and basic promotional features.',
      shortDescription: 'More listings with basic promotion',
      sortOrder: 2,
      billingCycle: 'monthly',
      durationDays: 9125, // 25 years but quota-based expiry
      showOriginalPrice: false,
      showOfferBadge: false,
      isDefault: false,
      isFeatured: false,
      isSystemPlan: false,
      isFreePlan: false,
      isQuotaBased: true,
      supportLevel: 'standard',
      features: {
        showPhoneNumber: true,
        showWhatsapp: true,
        allowChat: true,
        priorityChatSupport: false,
        analyticsEnabled: true,
        viewCountVisible: true,
        trackLeads: true,
        sellerVerificationIncluded: false,
        trustBadge: false,
        warrantyBadge: false,
        geoTargetingEnabled: false,
        radiusTargetingKm: null,
        socialSharingEnabled: true,
        createPromotions: false,
        autoApproval: false,
        priorityModeration: false,
        appealRejectedListings: true
      },
      visibility: {
        priorityScore: 10,
        searchBoostMultiplier: 1.2,
        recommendationBoostMultiplier: 1.1,
        crossCityVisibility: true,
        nationalVisibility: false
      },
      featuredLimits: {
        maxFeaturedListings: 1,
        maxBoostedListings: 1,
        maxSpotlightListings: 0,
        maxHomepageListings: 0,
        featuredDays: 7,
        boostedDays: 3,
        spotlightDays: 0
      }
    },
    {
      tier: 'standard',
      name: 'Standard Plan',
      tagline: 'Most popular choice',
      description: 'For serious sellers. Enhanced visibility with featured listings and priority support.',
      shortDescription: 'Enhanced visibility and priority support',
      sortOrder: 3,
      billingCycle: 'monthly',
      durationDays: 9125, // 25 years but quota-based expiry
      showOriginalPrice: true,
      showOfferBadge: true,
      offerBadgeText: 'POPULAR',
      isDefault: false,
      isFeatured: true,
      isSystemPlan: false,
      isFreePlan: false,
      isQuotaBased: true,
      supportLevel: 'priority',
      features: {
        showPhoneNumber: true,
        showWhatsapp: true,
        allowChat: true,
        priorityChatSupport: true,
        analyticsEnabled: true,
        viewCountVisible: true,
        trackLeads: true,
        sellerVerificationIncluded: true,
        trustBadge: true,
        warrantyBadge: false,
        geoTargetingEnabled: true,
        radiusTargetingKm: 100,
        socialSharingEnabled: true,
        createPromotions: true,
        autoApproval: false,
        priorityModeration: true,
        appealRejectedListings: true
      },
      visibility: {
        priorityScore: 25,
        searchBoostMultiplier: 1.4,
        recommendationBoostMultiplier: 1.3,
        crossCityVisibility: true,
        nationalVisibility: true
      },
      featuredLimits: {
        maxFeaturedListings: 5,
        maxBoostedListings: 3,
        maxSpotlightListings: 1,
        maxHomepageListings: 0,
        featuredDays: 15,
        boostedDays: 7,
        spotlightDays: 3
      }
    },
    {
      tier: 'premium',
      name: 'Premium Plan',
      tagline: 'For professional sellers',
      description: 'For businesses and professional sellers. Maximum visibility with auto-approval and dedicated support.',
      shortDescription: 'Maximum visibility with dedicated support',
      sortOrder: 4,
      billingCycle: 'monthly',
      durationDays: 9125, // 25 years but quota-based expiry
      showOriginalPrice: true,
      showOfferBadge: true,
      offerBadgeText: 'BEST VALUE',
      isDefault: false,
      isFeatured: true,
      isSystemPlan: false,
      isFreePlan: false,
      isQuotaBased: true,
      supportLevel: 'dedicated',
      features: {
        showPhoneNumber: true,
        showWhatsapp: true,
        allowChat: true,
        priorityChatSupport: true,
        analyticsEnabled: true,
        viewCountVisible: true,
        trackLeads: true,
        sellerVerificationIncluded: true,
        trustBadge: true,
        warrantyBadge: true,
        geoTargetingEnabled: true,
        radiusTargetingKm: 500,
        socialSharingEnabled: true,
        createPromotions: true,
        autoApproval: true,
        priorityModeration: true,
        appealRejectedListings: true
      },
      visibility: {
        priorityScore: 50,
        searchBoostMultiplier: 1.8,
        recommendationBoostMultiplier: 1.6,
        crossCityVisibility: true,
        nationalVisibility: true
      },
      featuredLimits: {
        maxFeaturedListings: 15,
        maxBoostedListings: 8,
        maxSpotlightListings: 3,
        maxHomepageListings: 1,
        featuredDays: 30,
        boostedDays: 15,
        spotlightDays: 7
      }
    },
    {
      tier: 'test',
      name: 'Test Plan',
      tagline: 'For testing featured listings',
      description: 'Test plan with limited featured listings for development and testing purposes.',
      shortDescription: 'Test plan with 1 featured listing',
      sortOrder: 5,
      billingCycle: 'monthly',
      durationDays: 30,
      showOriginalPrice: false,
      showOfferBadge: true,
      offerBadgeText: 'TEST',
      isDefault: false,
      isFeatured: false,
      isSystemPlan: false,
      isFreePlan: false,
      isQuotaBased: true,
      supportLevel: 'standard',
      features: {
        showPhoneNumber: true,
        showWhatsapp: true,
        allowChat: true,
        priorityChatSupport: false,
        analyticsEnabled: true,
        viewCountVisible: true,
        trackLeads: true,
        sellerVerificationIncluded: false,
        trustBadge: false,
        warrantyBadge: false,
        geoTargetingEnabled: false,
        radiusTargetingKm: null,
        socialSharingEnabled: true,
        createPromotions: false,
        autoApproval: false,
        priorityModeration: false,
        appealRejectedListings: true
      },
      visibility: {
        priorityScore: 5,
        searchBoostMultiplier: 1.1,
        recommendationBoostMultiplier: 1.0,
        crossCityVisibility: false,
        nationalVisibility: false
      },
      featuredLimits: {
        maxFeaturedListings: 2,
        maxBoostedListings: 0,
        maxSpotlightListings: 0,
        maxHomepageListings: 0,
        featuredDays: 7,
        boostedDays: 0,
        spotlightDays: 0
      }
    }
  ];

  // Common fields for all plans
  const getCommonFields = (categoryConfig, planTier) => ({
    version: 1,
    currency: 'INR',
    terms_and_conditions: null,
    is_active: true,
    is_public: planTier.isPublic,
    deprecated_at: null,
    replaced_by_plan_id: null,
    created_by: null,
    updated_by: null,
    deleted_by: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    // Management fields
    auto_renewal: false,
    max_renewals: 0,
    listing_duration_days: planTier.tier === 'free' ? 30 : (planTier.tier === 'premium' ? 60 : 45),
    auto_refresh_enabled: planTier.tier === 'premium',
    refresh_frequency_days: planTier.tier === 'premium' ? 7 : null,
    manual_refresh_per_cycle: planTier.tier === 'free' ? 0 : (planTier.tier === 'basic' ? 3 : (planTier.tier === 'standard' ? 5 : 10)),
    is_auto_approve_enabled: planTier.tier === 'premium',
    // Stringify JSON fields
    features: JSON.stringify(planTier.features),
    available_addons: JSON.stringify(planTier.tier === 'free' ? [] : ['extra_boost', 'featured_upgrade']),
    metadata: JSON.stringify({ categoryType: categoryConfig.categoryType })
  });

  // Generate plans for each category and tier
  const plansToInsert = [];

  categoryConfigs.forEach(categoryConfig => {
    planTiers.forEach(planTier => {
      const planCode = `${categoryConfig.categoryType}-${planTier.tier}`;
      const planName = `${categoryConfig.categoryType.charAt(0).toUpperCase() + categoryConfig.categoryType.slice(1)} ${planTier.name}`;
      
      // Get quota configuration based on tier
      let quotaConfig;
      let pricing = { basePrice: 0, discountAmount: 0, finalPrice: 0 };
      
      switch (planTier.tier) {
        case 'free':
          quotaConfig = {
            maxTotalListings: categoryConfig.freeQuota.limit, // Same as listingQuotaLimit
            maxActiveListings: categoryConfig.freeQuota.activeListings,
            listingQuotaLimit: categoryConfig.freeQuota.limit,
            listingQuotaRollingDays: 30
          };
          break;
        case 'basic':
          quotaConfig = {
            maxTotalListings: categoryConfig.basicQuota.total,
            maxActiveListings: categoryConfig.basicQuota.activeListings,
            listingQuotaLimit: categoryConfig.basicQuota.total, // Same as maxTotalListings
            listingQuotaRollingDays: 30
          };
          pricing = {
            basePrice: categoryConfig.basicQuota.price,
            discountAmount: 0,
            finalPrice: categoryConfig.basicQuota.price
          };
          break;
        case 'standard':
          quotaConfig = {
            maxTotalListings: categoryConfig.standardQuota.total,
            maxActiveListings: categoryConfig.standardQuota.activeListings,
            listingQuotaLimit: categoryConfig.standardQuota.total, // Same as maxTotalListings
            listingQuotaRollingDays: 30
          };
          const standardDiscount = Math.round(categoryConfig.standardQuota.price * 0.1);
          pricing = {
            basePrice: categoryConfig.standardQuota.price + standardDiscount,
            discountAmount: standardDiscount,
            finalPrice: categoryConfig.standardQuota.price
          };
          break;
        case 'premium':
          quotaConfig = {
            maxTotalListings: categoryConfig.premiumQuota.total,
            maxActiveListings: categoryConfig.premiumQuota.activeListings,
            listingQuotaLimit: categoryConfig.premiumQuota.total, // Same as maxTotalListings
            listingQuotaRollingDays: 30
          };
          const premiumDiscount = Math.round(categoryConfig.premiumQuota.price * 0.15);
          pricing = {
            basePrice: categoryConfig.premiumQuota.price + premiumDiscount,
            discountAmount: premiumDiscount,
            finalPrice: categoryConfig.premiumQuota.price
          };
          break;
        case 'test':
          quotaConfig = {
            maxTotalListings: categoryConfig.testQuota.total,
            maxActiveListings: categoryConfig.testQuota.activeListings,
            listingQuotaLimit: categoryConfig.testQuota.total,
            listingQuotaRollingDays: 30
          };
          pricing = {
            basePrice: categoryConfig.testQuota.price,
            discountAmount: 0,
            finalPrice: categoryConfig.testQuota.price
          };
          break;
      }

      // Determine upsell suggestion
      const upsellMap = {
        'free': 'basic',
        'basic': 'standard',
        'standard': 'premium',
        'premium': null,
        'test': 'basic'
      };
      const nextTier = upsellMap[planTier.tier];
      const upsellSuggestion = nextTier ? { recommended: `${categoryConfig.categoryType}-${nextTier}` } : {};

      const plan = {
        category_id: categoryConfig.category.id,
        category_name: categoryConfig.category.name,
        plan_code: planCode,
        name: planName,
        slug: planCode,
        description: planTier.description.replace('listings', `${categoryConfig.categoryType} listings`),
        short_description: planTier.shortDescription.replace('listings', `${categoryConfig.categoryType} listings`),
        tagline: planTier.tagline.replace('selling', `selling ${categoryConfig.categoryType}`),
        sort_order: planTier.sortOrder,
        billing_cycle: planTier.billingCycle,
        duration_days: planTier.durationDays,
        show_original_price: planTier.showOriginalPrice,
        show_offer_badge: planTier.showOfferBadge,
        offer_badge_text: planTier.offerBadgeText || null,
        is_default: planTier.isDefault,
        is_featured: planTier.isFeatured,
        is_system_plan: planTier.isSystemPlan,
        is_free_plan: planTier.isFreePlan,
        is_quota_based: planTier.isQuotaBased,
        support_level: planTier.supportLevel,
        internal_notes: `${planTier.name} for ${categoryConfig.categoryType} listings${planTier.tier === 'free' ? ' - auto-assigned on registration' : ''}`,
        upsell_suggestions: JSON.stringify(upsellSuggestion),
        // Pricing
        base_price: pricing.basePrice,
        discount_amount: pricing.discountAmount,
        final_price: pricing.finalPrice,
        // Quotas
        max_total_listings: quotaConfig.maxTotalListings,
        max_active_listings: quotaConfig.maxActiveListings,
        listing_quota_limit: quotaConfig.listingQuotaLimit,
        listing_quota_rolling_days: quotaConfig.listingQuotaRollingDays,
        // Featured limits
        max_featured_listings: planTier.featuredLimits.maxFeaturedListings,
        max_boosted_listings: planTier.featuredLimits.maxBoostedListings,
        max_spotlight_listings: planTier.featuredLimits.maxSpotlightListings,
        max_homepage_listings: planTier.featuredLimits.maxHomepageListings,
        featured_days: planTier.featuredLimits.featuredDays,
        boosted_days: planTier.featuredLimits.boostedDays,
        spotlight_days: planTier.featuredLimits.spotlightDays,
        // Visibility
        priority_score: planTier.visibility.priorityScore,
        search_boost_multiplier: planTier.visibility.searchBoostMultiplier,
        recommendation_boost_multiplier: planTier.visibility.recommendationBoostMultiplier,
        cross_city_visibility: planTier.visibility.crossCityVisibility,
        national_visibility: planTier.visibility.nationalVisibility,
        // Add common fields
        ...getCommonFields(categoryConfig, planTier)
      };

      plansToInsert.push(plan);
    });
  });

  await queryInterface.bulkInsert('subscription_plans', plansToInsert);


}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('subscription_plans', {
    plan_code: {
      [Sequelize.Op.in]: [
        'cars-free', 'cars-basic', 'cars-standard', 'cars-premium', 'cars-test',
        'properties-free', 'properties-basic', 'properties-standard', 'properties-premium', 'properties-test'
      ]
    }
  });
}
