export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    const now = new Date();

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

    // Step 1: Get all users who have cars-premium plan
    const premiumUsers = await queryInterface.sequelize.query(
      `SELECT DISTINCT u.id, u.email, u.full_name, us.id as subscription_id
       FROM users u
       INNER JOIN user_subscriptions us ON u.id = us.user_id
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE sp.slug = 'cars-premium' 
       AND us.status = 'active'
       ORDER BY u.id`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (!premiumUsers || premiumUsers.length === 0) {
      throw new Error('No users with cars-premium plan found. Please run premium users seeder first.');
    }

    console.log(`✓ Found ${premiumUsers.length} users with cars-premium plan:`);
    premiumUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - User ID: ${user.id}, Subscription ID: ${user.subscription_id}`);
    });

    // Step 2: Get car category
    const carCategory = await queryInterface.sequelize.query(
      `SELECT id, name, slug FROM categories WHERE slug = 'cars' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (!carCategory || carCategory.length === 0) {
      throw new Error('Car category not found. Please run category seeder first.');
    }

    const categoryId = carCategory[0].id;
    const categorySlug = carCategory[0].slug;
    console.log(`\n✓ Found car category: ${carCategory[0].name} (ID: ${categoryId}, Slug: ${categorySlug})`);

    // Step 3: Get car brands by slugs
    const brandSlugs = ['bmw', 'hyundai', 'honda', 'skoda', 'tata', 'toyota', 'maruti-suzuki'];
    
    const brands = await queryInterface.sequelize.query(
      `SELECT id, name, slug FROM car_brands WHERE slug IN (:slugs) ORDER BY name`,
      { 
        replacements: { slugs: brandSlugs },
        type: Sequelize.QueryTypes.SELECT, 
        transaction 
      }
    );

    if (!brands || brands.length === 0) {
      throw new Error('No car brands found. Please run car data seeder first.');
    }

    console.log(`\n✓ Found ${brands.length} car brands:`);
    brands.forEach(brand => {
      console.log(`  - ${brand.name} (${brand.slug}) - ID: ${brand.id}`);
    });

    // Step 4: Get models for each brand
    const brandIds = brands.map(b => b.id);
    
    const models = await queryInterface.sequelize.query(
      `SELECT id, brand_id, name FROM car_models WHERE brand_id IN (:brandIds) ORDER BY brand_id, name`,
      { 
        replacements: { brandIds },
        type: Sequelize.QueryTypes.SELECT, 
        transaction 
      }
    );

    if (!models || models.length === 0) {
      throw new Error('No car models found. Please run car data seeder first.');
    }

    console.log(`\n✓ Found ${models.length} car models across all brands`);
    
    // Group models by brand for display
    const modelsByBrand = {};
    models.forEach(model => {
      if (!modelsByBrand[model.brand_id]) {
        modelsByBrand[model.brand_id] = [];
      }
      modelsByBrand[model.brand_id].push(model);
    });

    brands.forEach(brand => {
      const brandModels = modelsByBrand[brand.id] || [];
      console.log(`  - ${brand.name}: ${brandModels.length} models`);
    });

    // Step 5: Get variants for each brand-model combination
    const modelIds = models.map(m => m.id);
    
    const variants = await queryInterface.sequelize.query(
      `SELECT id, brand_id, model_id, variant_name FROM car_variants 
       WHERE brand_id IN (:brandIds) AND model_id IN (:modelIds) 
       ORDER BY brand_id, model_id, variant_name`,
      { 
        replacements: { brandIds, modelIds },
        type: Sequelize.QueryTypes.SELECT, 
        transaction 
      }
    );

    if (!variants || variants.length === 0) {
      throw new Error('No car variants found. Please run car data seeder first.');
    }

    console.log(`\n✓ Found ${variants.length} car variants across all models`);
    
    // Group variants by brand for display
    const variantsByBrand = {};
    variants.forEach(variant => {
      if (!variantsByBrand[variant.brand_id]) {
        variantsByBrand[variant.brand_id] = [];
      }
      variantsByBrand[variant.brand_id].push(variant);
    });

    brands.forEach(brand => {
      const brandVariants = variantsByBrand[brand.id] || [];
      console.log(`  - ${brand.name}: ${brandVariants.length} variants`);
    });

    // Step 6: Create 21 car listings (3 users × 7 brands × 1 variant)
    console.log(`\n✓ Step 6: Creating car listings dataset...`);
    
    // Satara pincodes for location data with localities
    const sataraLocations = [
      { "pincode": "415001", "locality": "Satara City, Powai Naka" },
      { "pincode": "415002", "locality": "Shivajinagar, Godoli" },
      { "pincode": "415003", "locality": "MIDC Satara" },
      { "pincode": "415004", "locality": "Sadar Bazar" },
      { "pincode": "415005", "locality": "Ajinkyatara Fort Area" },
      { "pincode": "415006", "locality": "Mangalwar Peth" },
      { "pincode": "415010", "locality": "Karanje Turf Satara" },
      { "pincode": "415011", "locality": "Shendre MIDC" },
      { "pincode": "415012", "locality": "Yashodanagar" },
      { "pincode": "415013", "locality": "Godoli Camp" },
      { "pincode": "415014", "locality": "Degaon" },
      { "pincode": "415015", "locality": "Bombale" },
      { "pincode": "415016", "locality": "Varye" },
      { "pincode": "415017", "locality": "Pawarwadi" },
      { "pincode": "415018", "locality": "Sajjangad Road" },
      { "pincode": "415019", "locality": "Nagthane" },
      { "pincode": "415020", "locality": "Apshinge" },
      { "pincode": "415021", "locality": "Limb" },
      { "pincode": "415022", "locality": "Yeradwadi" },
      { "pincode": "415023", "locality": "Choragewadi" }
    ];

    const sataraPincodes = sataraLocations.map(loc => loc.pincode);

    // Get cities by pincodes (will have state_id, state_name, city name, lat, long)
    const locationCities = await queryInterface.sequelize.query(
      `SELECT c.id, c.name as city_name, c.state_id, s.name as state_name, c.pincode, c.latitude, c.longitude 
       FROM cities c
       INNER JOIN states s ON c.state_id = s.id
       WHERE c.pincode IN (:pincodes) AND c.is_active = true
       ORDER BY c.pincode`,
      { 
        replacements: { pincodes: sataraPincodes },
        type: Sequelize.QueryTypes.SELECT, 
        transaction 
      }
    );

    if (!locationCities || locationCities.length === 0) {
      throw new Error('No cities found with specified pincodes. Please run cities seeder first.');
    }

    console.log(`✓ Found ${locationCities.length} Satara locations with pincodes`);

    // Prepare listing data
    const listingsToCreate = [];
    let listingIndex = 0;

    // Pre-generate unique share codes for all listings (21 total for 3 users × 7 brands × 1 variant)
    const totalListingsCount = premiumUsers.length * 7;
    const shareCodes = generateUniqueShareCodes(totalListingsCount, 'SEC');
    console.log(`✓ Generated ${shareCodes.length} unique share codes with prefix 'SEC'`);

    // Title prefixes for variety
    const titlePrefixes = [
      'I want to sell', 'For sale', 'Selling', 'Looking to sell',
      'Urgent sale', 'Well maintained', 'Excellent condition'
    ];

    // Strategy: Create 21 listings (3 users × 7 brands × 1 variant each)
    // Each user gets 7 listings (one from each brand)
    premiumUsers.forEach((user, userIndex) => {
      brands.forEach((brand, brandIndex) => {
        const brandModels = modelsByBrand[brand.id] || [];
        
        if (brandModels.length === 0) {
          console.log(`⚠️  Warning: ${brand.name} has no models`);
          return;
        }

        // Pick first model for this brand
        const model = brandModels[0];

        // Get variants for this specific model
        const modelVariants = variants.filter(v => v.model_id === model.id && v.brand_id === brand.id);
        
        if (modelVariants.length === 0) {
          console.log(`⚠️  Warning: No variants found for ${brand.name} ${model.name}`);
          return;
        }
        
        // Pick first variant for this model
        const variant = modelVariants[0];
        
        // Each user gets unique locations from Satara (7 locations per user)
        const locationIndex = (userIndex * 7 + brandIndex) % locationCities.length;
        const location = locationCities[locationIndex];
        
        // Get locality from sataraLocations array
        const localityData = sataraLocations.find(loc => loc.pincode === location.pincode);
        const locality = localityData ? localityData.locality : location.city_name;

        const year = 2018 + (listingIndex % 7); // Years 2018-2024
        const mileage = 20000 + (listingIndex * 10000); // 20k to 220k km
        const price = 400000 + (listingIndex * 100000); // 4L to 24L
        const fuelTypes = ['petrol', 'diesel', 'cng', 'electric'];
        const transmissions = ['manual', 'automatic'];
        const colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Brown'];
        
        const fuelType = fuelTypes[listingIndex % fuelTypes.length];
        const transmission = transmissions[listingIndex % transmissions.length];
        const color = colors[listingIndex % colors.length];
        const ownersCount = 1 + (listingIndex % 3);

        // Realistic title with prefix
        const titlePrefix = titlePrefixes[listingIndex % titlePrefixes.length];
        const title = `${titlePrefix} ${year} ${brand.name} ${model.name} ${variant.variant_name} ${fuelType.toUpperCase()} ${transmission.toUpperCase()}`;
        
        // Generate slug from title with 4 random lowercase alphabets
        const slug = customSlugify(title) + '-' + generateRandomSuffix();
        
        // Realistic description
        const description = `Selling my well-maintained ${year} ${brand.name} ${model.name} ${variant.variant_name} in excellent condition. This ${color} ${fuelType} ${transmission} variant has been driven ${mileage.toLocaleString()} km with ${ownersCount} owner${ownersCount > 1 ? 's' : ''}. Regular service done at authorized ${brand.name} service center. All original documents available. Insurance valid. Located in ${locality}, ${location.city_name}, ${location.state_name}. Serious buyers only. Price slightly negotiable.`;
        
        // Keywords for search
        const keywords = `${brand.name}, ${model.name}, ${variant.variant_name}, ${locality}, ${location.city_name}, ${year}, ${fuelType}, ${transmission}, ${color}, ${price}, ${mileage}km, ${ownersCount} owner, Satara, used car, second hand car`;

        // Randomly assign 7 to 12 features
        const allFeatures = [
          'Air Conditioning', 'Power Steering', 'Power Windows', 'ABS', 'Airbags',
          'Alloy Wheels', 'Fog Lights', 'Music System', 'Central Locking', 'Sunroof',
          'Leather Seats', 'GPS Navigation', 'Bluetooth', 'Parking Sensors', 'Backup Camera'
        ];
        
        // Shuffle features and pick 7-12 randomly
        const shuffled = [...allFeatures].sort(() => Math.random() - 0.5);
        const featureCount = 7 + Math.floor(Math.random() * 6); // 7 to 12
        const selectedFeatures = shuffled.slice(0, featureCount);

        // No featured listings in this seeder
        const isFeatured = false;
        const featuredUntil = null;

        // Prepare essential_data JSONB
        const essentialData = {
          year: year,
          fuelType: fuelType,
          brandName: brand.name,
          mileageKm: mileage,
          modelName: model.name,
          variantName: variant.variant_name
        };

        listingsToCreate.push({
          user_id: user.id,
          brand_id: brand.id,
          brand_name: brand.name,
          model_id: model.id,
          model_name: model.name,
          variant_id: variant.id,
          variant_name: variant.variant_name,
          year: year,
          mileage_km: mileage,
          price: price,
          fuel_type: fuelType,
          transmission: transmission,
          color: color,
          owners_count: ownersCount,
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
          features: selectedFeatures,
          category_id: categoryId,
          category_slug: categorySlug,
          essential_data: essentialData,
          status: 'active',
          is_approved: true,
          is_featured: isFeatured,
          featured_until: featuredUntil,
          share_code: shareCodes[listingIndex]
        });

        listingIndex++;
      });
    });

    console.log(`✓ Prepared ${listingsToCreate.length} car listings`);
    console.log(`  - Distribution: ${premiumUsers.length} users × ${brands.length} brands × 1 variant = ${listingsToCreate.length} listings`);
    console.log(`  - Each user has 7 unique locations from Satara`);

    // Step 7: Insert listings into database
    console.log(`\n✓ Step 7: Inserting listings into database...`);

    const insertedListings = [];

    for (const listingData of listingsToCreate) {
      // Generate random timestamp for this listing
      const createdAt = generateRandomTimestamp();
      const updatedAt = createdAt;
      const publishedAt = createdAt;
      const approvedAt = createdAt;

      // Build essential_data JSONB
      const essentialData = JSON.stringify({
        brandName: listingData.brand_name,
        modelName: listingData.model_name,
        variantName: listingData.variant_name,
        year: listingData.year,
        mileageKm: listingData.mileage_km,
        fuelType: listingData.fuel_type
      });

      // Insert into listings table
      const [listingResult] = await queryInterface.sequelize.query(
        `INSERT INTO listings 
         (user_id, category_id, category_slug, title, slug, share_code, description, keywords, price, price_negotiable,
          state_id, state_name, city_id, city_name, locality, pincode, latitude, longitude,
          cover_image, cover_image_storage_type, cover_image_mime_type,
          status, is_featured, featured_until, published_at, approved_at, approved_by, expires_at,
          essential_data, created_by, created_at, updated_at)
         VALUES 
         (:userId, :categoryId, :categorySlug, :title, :slug, :shareCode, :description, :keywords, :price, true,
          :stateId, :stateName, :cityId, :cityName, :locality, :pincode, :latitude, :longitude,
          :coverImage, :coverImageStorageType, :coverImageMimeType,
          'active', :isFeatured, :featuredUntil, :now, :now, :userId, :expiresAt,
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
            price: listingData.price,
            stateId: listingData.state_id,
            stateName: listingData.state_name,
            cityId: listingData.city_id,
            cityName: listingData.city_name,
            locality: listingData.locality,
            pincode: listingData.pincode,
            latitude: listingData.latitude,
            longitude: listingData.longitude,
            coverImage: 'uploads/listings/user-3/images/20260104020048-car-audi-auto-ehp',
            coverImageStorageType: 'cloudinary',
            coverImageMimeType: 'image/jpeg',
            isFeatured: listingData.is_featured,
            featuredUntil: listingData.is_featured ? new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
            essentialData: essentialData,
            now: createdAt,
            expiresAt: new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days from createdAt
          },
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      const listingId = listingResult[0].id;

      // Insert into car_listings table
      await queryInterface.sequelize.query(
        `INSERT INTO car_listings 
         (listing_id, brand_id, brand_name, model_id, model_name, variant_id, variant_name,
          year, mileage_km, condition, owners_count, fuel_type, transmission, color, seats, features,
          created_at, updated_at)
         VALUES 
         (:listingId, :brandId, :brandName, :modelId, :modelName, :variantId, :variantName,
          :year, :mileageKm, 'used', :ownersCount, :fuelType, :transmission, :color, 5, :features,
          :now, :now)`,
        {
          replacements: {
            listingId: listingId,
            brandId: listingData.brand_id,
            brandName: listingData.brand_name,
            modelId: listingData.model_id,
            modelName: listingData.model_name,
            variantId: listingData.variant_id,
            variantName: listingData.variant_name,
            year: listingData.year,
            mileageKm: listingData.mileage_km,
            ownersCount: listingData.owners_count,
            fuelType: listingData.fuel_type,
            transmission: listingData.transmission,
            color: listingData.color,
            features: JSON.stringify(listingData.features),
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
         (:listingId, 'image', :mediaUrl, :thumbnailUrl, 'image/jpeg', 'image/jpeg',
          102400, 1200, 800, 0, true, 'cloudinary',
          :now, :now)`,
        {
          replacements: {
            listingId: listingId,
            mediaUrl: 'uploads/listings/user-3/images/20260104020048-car-audi-auto-ehp',
            thumbnailUrl: 'uploads/listings/user-3/images/20260104020048-car-audi-auto-ehp',
            now: createdAt
          },
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      insertedListings.push({
        id: listingId,
        title: listingData.title,
        user: premiumUsers.find(u => u.id === listingData.user_id).full_name
      });
    }

    console.log(`✓ Successfully inserted ${insertedListings.length} car listings`);
    console.log(`  - All listings are ACTIVE and APPROVED`);
    console.log(`  - No featured listings in this batch`);
    console.log(`  - All listings have primary image (cloudinary storage)`);
    console.log(`  - Each listing has 7-12 random features`);
    console.log(`  - Listings expire in 60 days`);
    console.log(`  - Locations: Satara city and surrounding areas`);

    await transaction.commit();
    console.log('\n✓ Additional car listings seeder completed successfully!');

  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding car listings:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Get all users with cars-premium plan
    const premiumUsers = await queryInterface.sequelize.query(
      `SELECT DISTINCT u.id
       FROM users u
       INNER JOIN user_subscriptions us ON u.id = us.user_id
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE sp.slug = 'cars-premium' 
       AND us.status = 'active'`,
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    if (premiumUsers && premiumUsers.length > 0) {
      const userIds = premiumUsers.map(u => u.id);

      // Delete only listings from Satara (pincode starts with 415)
      await queryInterface.sequelize.query(
        `DELETE FROM listing_media 
         WHERE listing_id IN (
           SELECT id FROM listings 
           WHERE user_id IN (:userIds) 
           AND pincode LIKE '415%'
         )`,
        { replacements: { userIds }, transaction }
      );

      await queryInterface.sequelize.query(
        `DELETE FROM car_listings 
         WHERE listing_id IN (
           SELECT id FROM listings 
           WHERE user_id IN (:userIds) 
           AND pincode LIKE '415%'
         )`,
        { replacements: { userIds }, transaction }
      );

      await queryInterface.sequelize.query(
        `DELETE FROM listings 
         WHERE user_id IN (:userIds) 
         AND pincode LIKE '415%'`,
        { replacements: { userIds }, transaction }
      );

      console.log(`✓ Removed Satara car listings for ${premiumUsers.length} premium users`);
    } else {
      console.log('✓ No car listings to remove');
    }

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('Error removing car listings:', error);
    throw error;
  }
}