export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    const now = new Date();

    // Media constants for different property types
    const MEDIA_CONFIG = {
      apartment: {
        url: 'uploads/listings/user-3/images/20260104130046-flats-zr8',
        mimeType: 'image/jpeg'
      },
      house: {
        url: 'uploads/listings/user-3/images/20260104130046-flats-zr8',
        mimeType: 'image/jpeg'
      },
      shop: {
        url: 'uploads/listings/user-3/images/20260104130046-flats-zr8',
        mimeType: 'image/jpeg'
      },
      hostel: {
        url: 'uploads/listings/user-3/images/20260104130046-flats-zr8',
        mimeType: 'image/jpeg'
      },
      plot: {
        url: 'uploads/listings/user-3/images/20260104135426-plots-photo-e5x',
        mimeType: 'image/jpeg'
      },
      warehouse: {
        url: 'uploads/listings/user-3/images/20260104130046-flats-zr8',
        mimeType: 'image/jpeg'
      }
    };
    const STORAGE_TYPE = 'cloudinary';

    // Helper function to generate slug
    const customSlugify = (text) => {
      const safeText = text ?? '';
      let slug = safeText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 200);
      return slug;
    };

    // Helper function to generate 4 random lowercase alphabets
    const generateRandomSuffix = () => {
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      let suffix = '';
      for (let i = 0; i < 4; i++) {
        suffix += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      return suffix;
    };

    // Helper function to generate random timestamp within last 5 days
    const generateRandomTimestamp = () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
      const randomTime = fiveDaysAgo.getTime() + Math.random() * (5 * 24 * 60 * 60 * 1000);
      return new Date(randomTime);
    };

    // Helper function to generate unique share codes with prefix
    const generateUniqueShareCodes = (count, prefix) => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const codes = new Set();
      
      while (codes.size < count) {
        let code = prefix;
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        codes.add(code);
      }
      
      return Array.from(codes);
    };

    // Step 1: Get all users who have properties-premium plan
    const premiumUsers = await queryInterface.sequelize.query(
      `SELECT DISTINCT u.id, u.email, u.full_name, us.id as subscription_id, sp.category_id
       FROM users u
       INNER JOIN user_subscriptions us ON u.id = us.user_id
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE sp.slug = 'properties-premium' 
       AND us.status = 'active'
       ORDER BY u.id`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (!premiumUsers || premiumUsers.length === 0) {
      throw new Error('No users with properties-premium plan found. Please run premium users seeder first.');
    }

    console.log(`✓ Found ${premiumUsers.length} users with properties-premium plan:`);
    premiumUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - User ID: ${user.id}, Subscription ID: ${user.subscription_id}, Category ID: ${user.category_id}`);
    });

    // Step 2: Get properties category
    const propertyCategory = await queryInterface.sequelize.query(
      `SELECT id, name, slug FROM categories WHERE slug = 'properties' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (!propertyCategory || propertyCategory.length === 0) {
      throw new Error('Properties category not found. Please run category seeder first.');
    }

    const categoryId = propertyCategory[0].id;
    const categorySlug = propertyCategory[0].slug;
    console.log(`\n✓ Found properties category: ${propertyCategory[0].name} (ID: ${categoryId}, Slug: ${categorySlug})`);

    console.log(`\n✓ Step 3: Preparing property listings dataset...`);
    
    // Mumbai pincodes for location data with localities
    const mumbaiLocations = [
      { "pincode": "400001", "locality": "Fort, Kala Ghoda" },
      { "pincode": "400002", "locality": "Kalbadevi, Zaveri Bazaar" },
      { "pincode": "400004", "locality": "Girgaon, Charni Road" },
      { "pincode": "400007", "locality": "Grant Road, Tardeo" },
      { "pincode": "400008", "locality": "Mumbai Central" },
      { "pincode": "400011", "locality": "Lower Parel" },
      { "pincode": "400013", "locality": "Dadar West" },
      { "pincode": "400014", "locality": "Dadar East" },
      { "pincode": "400016", "locality": "Mahim" },
      { "pincode": "400017", "locality": "Dharavi" },
      { "pincode": "400018", "locality": "Worli" },
      { "pincode": "400019", "locality": "Matunga" },
      { "pincode": "400022", "locality": "Sion" },
      { "pincode": "400025", "locality": "Prabhadevi" },
      { "pincode": "400028", "locality": "Andheri West" },
      { "pincode": "400037", "locality": "Antop Hill" },
      { "pincode": "400050", "locality": "Bandra West" },
      { "pincode": "400051", "locality": "Bandra East" },
      { "pincode": "400054", "locality": "Santacruz West" },
      { "pincode": "400055", "locality": "Santacruz East" }
    ];

    const mumbaiPincodes = mumbaiLocations.map(loc => loc.pincode);

    // Get cities by pincodes (will have state_id, state_name, city name, lat, long)
    const locationCities = await queryInterface.sequelize.query(
      `SELECT c.id, c.name as city_name, c.state_id, s.name as state_name, c.pincode, c.latitude, c.longitude 
       FROM cities c
       INNER JOIN states s ON c.state_id = s.id
       WHERE c.pincode IN (:pincodes) AND c.is_active = true
       ORDER BY c.pincode`,
      { 
        replacements: { pincodes: mumbaiPincodes },
        type: Sequelize.QueryTypes.SELECT, 
        transaction 
      }
    );

    if (!locationCities || locationCities.length === 0) {
      throw new Error('No cities found with specified pincodes. Please run cities seeder first.');
    }

    console.log(`✓ Found ${locationCities.length} Mumbai locations with pincodes`);

    // Step 4: Prepare property listings data
    console.log(`\n✓ Step 4: Preparing property listings dataset...`);

    const listingsToCreate = [];
    let listingIndex = 0;

    // Pre-generate unique share codes for all listings (54 total for 3 users × 18 listings)
    const totalListingsCount = premiumUsers.length * 18;
    const shareCodes = generateUniqueShareCodes(totalListingsCount, 'THI');
    console.log(`✓ Generated ${shareCodes.length} unique share codes with prefix 'THI'`);

    // Property type configurations
    const propertyTypes = [
      { type: 'apartment', listingType: 'rent', unitTypes: ['1bhk', '2bhk', '3bhk'] },
      { type: 'house', listingType: 'sale', unitTypes: ['1bhk', '2bhk', '3bhk'] },
      { type: 'shop', listingType: 'rent', unitTypes: null },
      { type: 'hostel', listingType: 'rent', unitTypes: null },
      { type: 'plot', listingType: 'sale', unitTypes: null },
      { type: 'warehouse', listingType: 'rent', unitTypes: null }
    ];

    // Iterate through each user
    premiumUsers.forEach((user, userIndex) => {
      console.log(`\n  Processing listings for user: ${user.full_name}`);

      // Each user creates listings for all property types
      propertyTypes.forEach((propConfig) => {
        const { type: propertyType, listingType, unitTypes } = propConfig;
        const loopCount = unitTypes ? unitTypes.length : 3;

        for (let i = 0; i < loopCount; i++) {
          // Get unique location for this listing
          const locationIndex = (userIndex * 18 + listingIndex) % locationCities.length;
          const location = locationCities[locationIndex];
          const localityData = mumbaiLocations.find(loc => loc.pincode === location.pincode);
          const locality = localityData ? localityData.locality : location.city_name;

          // Generate property-specific data
          const propertyData = generatePropertyData(propertyType, unitTypes ? unitTypes[i] : null, listingIndex);

          // Generate title
          const title = generateTitle(propertyType, propertyData, locality);
          const slug = customSlugify(title) + '-' + generateRandomSuffix();

          // Generate description
          const description = generateDescription(propertyType, propertyData, locality, location);

          // Generate keywords
          const keywords = generateKeywords(propertyType, propertyData, locality, location);

          // Determine if featured (1 listing per user)
          const isFeatured = listingIndex === userIndex * 18;
          const featuredUntil = isFeatured ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null;

          // Prepare essential_data JSONB
          const essentialData = {
            propertyType: propertyType,
            listingType: listingType,
            areaSqft: propertyData.areaSqft,
            ...(propertyData.unitType && { unitType: propertyData.unitType })
          };

          listingsToCreate.push({
            user_id: user.id,
            property_type: propertyType,
            listing_type: listingType,
            property_data: propertyData,
            state_id: location.state_id,
            state_name: location.state_name,
            city_id: location.id,
            city_name: location.city_name,
            pincode: location.pincode,
            latitude: location.latitude,
            longitude: location.longitude,
            locality: locality,
            title: title,
            slug: slug,
            description: description,
            keywords: keywords,
            category_id: categoryId,
            category_slug: categorySlug,
            essential_data: essentialData,
            is_featured: isFeatured,
            featured_until: featuredUntil,
            share_code: shareCodes[listingIndex]
          });

          listingIndex++;
        }
      });
    });

    console.log(`\n✓ Prepared ${listingsToCreate.length} property listings`);
    console.log(`  - ${premiumUsers.length} users × 18 listings each (3 apartments + 3 houses + 3 shops + 3 hostels + 3 plots + 3 warehouses)`);
    console.log(`  - Each user has unique locations from Mumbai`);

    // Step 5: Insert listings into database
    console.log(`\n✓ Step 5: Inserting listings into database...`);

    const insertedListings = [];

    for (const listingData of listingsToCreate) {
      // Generate random timestamp for this listing
      const createdAt = generateRandomTimestamp();

      // Get media config for this property type
      const mediaConfig = MEDIA_CONFIG[listingData.property_type];

      // Build essential_data JSONB
      const essentialData = JSON.stringify(listingData.essential_data);

      // Get user's subscription ID for properties category (match by user_id AND category_id)
      const userSubscription = premiumUsers.find(u => u.id === listingData.user_id && u.category_id === listingData.category_id);
      const subscriptionId = userSubscription ? userSubscription.subscription_id : null;

      // Insert into listings table
      const [listingResult] = await queryInterface.sequelize.query(
        `INSERT INTO listings 
         (user_id, category_id, category_slug, title, slug, share_code, description, keywords, price, price_negotiable,
          state_id, state_name, city_id, city_name, locality, pincode, latitude, longitude,
          cover_image, cover_image_storage_type, cover_image_mime_type,
          status, is_featured, featured_until, published_at, approved_at, approved_by, expires_at,
          user_subscription_id, is_paid_listing, republish_count, last_republished_at,
          essential_data, created_by, created_at, updated_at)
         VALUES 
         (:userId, :categoryId, :categorySlug, :title, :slug, :shareCode, :description, :keywords, :price, true,
          :stateId, :stateName, :cityId, :cityName, :locality, :pincode, :latitude, :longitude,
          :coverImage, :coverImageStorageType, :coverImageMimeType,
          'active', :isFeatured, :featuredUntil, :now, :now, :userId, :expiresAt,
          :subscriptionId, true, 0, :now,
          :essentialData::jsonb, :userId, :now, :now)
         RETURNING id`,
        {
          replacements: {
            userId: listingData.user_id,
            categoryId: listingData.category_id,
            categorySlug: listingData.category_slug,
            title: listingData.title,
            slug: listingData.slug,
            shareCode: listingData.share_code,
            description: listingData.description,
            keywords: listingData.keywords,
            price: listingData.property_data.price,
            stateId: listingData.state_id,
            stateName: listingData.state_name,
            cityId: listingData.city_id,
            cityName: listingData.city_name,
            locality: listingData.locality,
            pincode: listingData.pincode,
            latitude: listingData.latitude,
            longitude: listingData.longitude,
            coverImage: mediaConfig.url,
            coverImageStorageType: STORAGE_TYPE,
            coverImageMimeType: mediaConfig.mimeType,
            isFeatured: listingData.is_featured,
            featuredUntil: listingData.featured_until,
            subscriptionId: subscriptionId,
            essentialData: essentialData,
            now: createdAt,
            expiresAt: new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days from createdAt
          },
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      const listingId = listingResult[0].id;

      // Insert into property_listings table
      const propData = listingData.property_data;
      
      await queryInterface.sequelize.query(
        `INSERT INTO property_listings 
         (listing_id, property_type, listing_type, unit_type, bathrooms, balconies,
          area_sqft, furnished, floor_number, total_floors, age_years, facing, parking_spaces,
          washrooms, amenities, food_included, gender_preference,
          boundary_wall, corner_plot, gated_community, plot_length_ft, plot_width_ft,
          covered_area_sqft, open_area_sqft, ceiling_height_ft, loading_docks,
          created_at, updated_at)
         VALUES 
         (:listingId, :propertyType, :listingType, :unitType, :bathrooms, :balconies,
          :areaSqft, :furnished, :floorNumber, :totalFloors, :ageYears, :facing, :parkingSpaces,
          :washrooms, :amenities, :foodIncluded, :genderPreference,
          :boundaryWall, :cornerPlot, :gatedCommunity, :plotLengthFt, :plotWidthFt,
          :coveredAreaSqft, :openAreaSqft, :ceilingHeightFt, :loadingDocks,
          :now, :now)`,
        {
          replacements: {
            listingId: listingId,
            propertyType: listingData.property_type,
            listingType: listingData.listing_type,
            unitType: propData.unitType,
            bathrooms: propData.bathrooms,
            balconies: propData.balconies,
            areaSqft: propData.areaSqft,
            furnished: propData.furnished,
            floorNumber: propData.floorNumber,
            totalFloors: propData.totalFloors,
            ageYears: propData.ageYears,
            facing: propData.facing,
            parkingSpaces: propData.parkingSpaces,
            washrooms: propData.washrooms,
            amenities: propData.amenities ? JSON.stringify(propData.amenities) : null,
            foodIncluded: propData.foodIncluded,
            genderPreference: propData.genderPreference,
            boundaryWall: propData.boundaryWall,
            cornerPlot: propData.cornerPlot,
            gatedCommunity: propData.gatedCommunity,
            plotLengthFt: propData.plotLengthFt,
            plotWidthFt: propData.plotWidthFt,
            coveredAreaSqft: propData.coveredAreaSqft,
            openAreaSqft: propData.openAreaSqft,
            ceilingHeightFt: propData.ceilingHeightFt,
            loadingDocks: propData.loadingDocks,
            now: createdAt
          },
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      // Insert into listing_media table
      await queryInterface.sequelize.query(
        `INSERT INTO listing_media 
         (listing_id, media_type, media_url, thumbnail_url, mime_type, thumbnail_mime_type,
          file_size_bytes, width, height, display_order, is_primary, storage_type,
          created_at, updated_at)
         VALUES 
         (:listingId, 'image', :mediaUrl, :thumbnailUrl, :mimeType, :thumbnailMimeType,
          102400, 1200, 800, 0, true, :storageType,
          :now, :now)`,
        {
          replacements: {
            listingId: listingId,
            mediaUrl: mediaConfig.url,
            thumbnailUrl: mediaConfig.url,
            mimeType: mediaConfig.mimeType,
            thumbnailMimeType: mediaConfig.mimeType,
            storageType: STORAGE_TYPE,
            now: createdAt
          },
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      insertedListings.push({
        id: listingId,
        title: listingData.title,
        type: listingData.property_type,
        user: premiumUsers.find(u => u.id === listingData.user_id).full_name
      });
    }

    console.log(`✓ Successfully inserted ${insertedListings.length} property listings`);
    console.log(`  - All listings are ACTIVE and APPROVED`);
    console.log(`  - ${premiumUsers.length} listings are FEATURED (1 per user, valid for 30 days)`);
    console.log(`  - All listings have primary image (cloudinary storage)`);
    console.log(`  - Listings expire in 60 days`);

    // Display summary by property type
    const summary = {};
    insertedListings.forEach(listing => {
      summary[listing.type] = (summary[listing.type] || 0) + 1;
    });
    console.log(`\n  Summary by property type:`);
    Object.keys(summary).forEach(type => {
      console.log(`    - ${type}: ${summary[type]} listings`);
    });

    // Helper function to generate property-specific data
    function generatePropertyData(propertyType, unitType, index) {
      const data = {
        price: 0,
        areaSqft: 0,
        unitType: unitType,
        bathrooms: null,
        balconies: null,
        furnished: null,
        floorNumber: null,
        totalFloors: null,
        ageYears: null,
        facing: null,
        parkingSpaces: null,
        amenities: [],
        washrooms: null,
        foodIncluded: null,
        genderPreference: null,
        boundaryWall: null,
        cornerPlot: null,
        gatedCommunity: null,
        plotLengthFt: null,
        plotWidthFt: null,
        coveredAreaSqft: null,
        openAreaSqft: null,
        ceilingHeightFt: null,
        loadingDocks: null
      };

      const facingOptions = ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'];
      const furnishedOptions = ['unfurnished', 'semi-furnished', 'fully-furnished'];

      switch (propertyType) {
        case 'apartment':
          data.areaSqft = 500 + (index * 100);
          data.price = 15000 + (index * 2000);
          data.bathrooms = unitType === '1bhk' ? 1 : (unitType === '2bhk' ? 2 : 3);
          data.balconies = unitType === '1bhk' ? 1 : 2;
          data.furnished = furnishedOptions[index % 3];
          data.floorNumber = 2 + (index % 10);
          data.totalFloors = 10 + (index % 5);
          data.ageYears = 1 + (index % 10);
          data.facing = facingOptions[index % 8];
          data.parkingSpaces = unitType === '1bhk' ? 1 : 2;
          data.amenities = ['Lift', 'Security', 'Power Backup', 'Gym', 'Swimming Pool'];
          break;

        case 'house':
          data.areaSqft = 1000 + (index * 200);
          data.price = 5000000 + (index * 500000);
          data.bathrooms = unitType === '1bhk' ? 1 : (unitType === '2bhk' ? 2 : 3);
          data.balconies = unitType === '1bhk' ? 1 : 2;
          data.furnished = furnishedOptions[index % 3];
          data.floorNumber = 1 + (index % 3);
          data.totalFloors = 2 + (index % 2);
          data.ageYears = 2 + (index % 15);
          data.facing = facingOptions[index % 8];
          data.parkingSpaces = 2 + (index % 2);
          data.amenities = ['Garden', 'Security', 'Power Backup', 'Water Supply'];
          break;

        case 'shop':
          data.areaSqft = 200 + (index * 50);
          data.price = 20000 + (index * 5000);
          data.washrooms = 1 + (index % 2);
          data.furnished = furnishedOptions[index % 3];
          data.floorNumber = 1 + (index % 5);
          data.totalFloors = 5 + (index % 3);
          data.ageYears = 1 + (index % 8);
          data.facing = facingOptions[index % 8];
          data.parkingSpaces = 1 + (index % 2);
          data.amenities = ['Parking', 'Security', 'Power Backup', 'CCTV'];
          break;

        case 'hostel':
          data.areaSqft = 800 + (index * 100);
          data.price = 8000 + (index * 1000);
          data.bathrooms = 4 + (index % 4);
          data.furnished = 'fully-furnished';
          data.floorNumber = 1 + (index % 5);
          data.totalFloors = 5 + (index % 3);
          data.ageYears = 1 + (index % 10);
          data.foodIncluded = ['yes', 'no', 'optional'][index % 3];
          data.genderPreference = ['male', 'female', 'any'][index % 3];
          data.amenities = ['Wi-Fi', 'Security', 'Laundry', 'Common Kitchen', 'CCTV'];
          break;

        case 'plot':
          data.areaSqft = 1000 + (index * 500);
          data.price = 2000000 + (index * 500000);
          data.facing = facingOptions[index % 8];
          data.boundaryWall = index % 2 === 0;
          data.cornerPlot = index % 3 === 0;
          data.gatedCommunity = index % 2 === 0;
          data.plotLengthFt = 40 + (index * 10);
          data.plotWidthFt = 25 + (index * 5);
          data.amenities = ['Water Supply', 'Electricity', 'Gated Security', 'Paved Road'];
          break;

        case 'warehouse':
          data.areaSqft = 5000 + (index * 1000);
          data.price = 100000 + (index * 20000);
          data.coveredAreaSqft = 3000 + (index * 500);
          data.openAreaSqft = 2000 + (index * 500);
          data.ceilingHeightFt = 15 + (index * 2);
          data.loadingDocks = 2 + (index % 3);
          data.floorNumber = 1;
          data.ageYears = 2 + (index % 10);
          data.parkingSpaces = 5 + (index % 5);
          data.amenities = ['Power Backup', 'Security', 'CCTV', 'Loading Bay', 'Office Space'];
          break;
      }

      return data;
    }

    // Helper function to generate title
    function generateTitle(propertyType, propertyData, locality) {
      const typeLabels = {
        apartment: 'Apartment',
        house: 'House',
        shop: 'Shop',
        hostel: 'Hostel',
        plot: 'Plot',
        warehouse: 'Warehouse'
      };

      const listingTypeLabel = propertyData.price > 1000000 ? 'for Sale' : 'for Rent';
      const unitTypeLabel = propertyData.unitType ? propertyData.unitType.toUpperCase() : '';
      const areaLabel = `${propertyData.areaSqft} sqft`;

      if (propertyData.unitType) {
        return `${unitTypeLabel} ${typeLabels[propertyType]} ${listingTypeLabel} in ${locality}`;
      } else {
        return `${areaLabel} ${typeLabels[propertyType]} ${listingTypeLabel} in ${locality}`;
      }
    }

    // Helper function to generate description
    function generateDescription(propertyType, propertyData, locality, location) {
      const typeLabels = {
        apartment: 'apartment',
        house: 'house',
        shop: 'commercial shop',
        hostel: 'hostel',
        plot: 'plot',
        warehouse: 'warehouse'
      };

      const listingTypeLabel = propertyData.price > 1000000 ? 'sale' : 'rent';
      let desc = `${typeLabels[propertyType]} available for ${listingTypeLabel} in ${locality}, ${location.city_name}. `;

      if (propertyData.unitType) {
        desc += `This ${propertyData.unitType.toUpperCase()} ${typeLabels[propertyType]} has ${propertyData.areaSqft} sqft area with ${propertyData.bathrooms} bathroom(s) and ${propertyData.balconies} balcony. `;
      } else {
        desc += `Total area: ${propertyData.areaSqft} sqft. `;
      }

      if (propertyData.furnished) {
        desc += `Furnished status: ${propertyData.furnished}. `;
      }

      if (propertyData.ageYears) {
        desc += `Property age: ${propertyData.ageYears} years. `;
      }

      if (propertyData.amenities && propertyData.amenities.length > 0) {
        desc += `Amenities: ${propertyData.amenities.join(', ')}. `;
      }

      desc += `Prime location with easy access to all facilities. Contact for more details.`;

      return desc;
    }

    // Helper function to generate keywords
    function generateKeywords(propertyType, propertyData, locality, location) {
      const keywords = [
        propertyType,
        locality,
        location.city_name,
        location.state_name,
        `${propertyData.areaSqft} sqft`,
        `Rs ${propertyData.price}`
      ];

      if (propertyData.unitType) {
        keywords.push(propertyData.unitType);
      }

      if (propertyData.furnished) {
        keywords.push(propertyData.furnished);
      }

      return keywords.join(', ');
    }

    await transaction.commit();
    console.log('\n✓ Property listings seeder completed successfully!');

  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding property listings:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Get all users with properties-premium plan
    const premiumUsers = await queryInterface.sequelize.query(
      `SELECT DISTINCT u.id
       FROM users u
       INNER JOIN user_subscriptions us ON u.id = us.user_id
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE sp.slug = 'properties-premium' 
       AND us.status = 'active'`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (premiumUsers && premiumUsers.length > 0) {
      const userIds = premiumUsers.map(u => u.id);

      // Delete listing_media for these users' listings
      await queryInterface.sequelize.query(
        `DELETE FROM listing_media 
         WHERE listing_id IN (SELECT id FROM listings WHERE user_id IN (:userIds))`,
        { replacements: { userIds }, transaction }
      );

      // Delete property_listings for these users' listings
      await queryInterface.sequelize.query(
        `DELETE FROM property_listings 
         WHERE listing_id IN (SELECT id FROM listings WHERE user_id IN (:userIds))`,
        { replacements: { userIds }, transaction }
      );

      // Delete listings for these users
      await queryInterface.sequelize.query(
        `DELETE FROM listings WHERE user_id IN (:userIds)`,
        { replacements: { userIds }, transaction }
      );

      console.log(`✓ Removed property listings for ${premiumUsers.length} premium users`);
    } else {
      console.log('✓ No property listings to remove');
    }

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('Error removing property listings:', error);
    throw error;
  }
}
