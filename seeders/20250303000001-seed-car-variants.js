import { Sequelize } from 'sequelize';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateSlug = (brandName, modelName, variantName) => {
  // Ensure inputs are strings
  const brand = String(brandName || '');
  const model = String(modelName || '');
  const variant = String(variantName || '');
  
  // Replace + with 'plus' before converting to slug
  const normalizedModel = model.replace(/\+/g, '-plus');
  const normalizedVariant = variant.replace(/\+/g, '-plus');
  
  return `${brand}-${normalizedModel}-${normalizedVariant}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-'); // Replace multiple dashes with single dash
};

const normalizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.trim().toLowerCase();
};

export default {
  up: async (queryInterface) => {
    // Read cars data from JSON file
    const carsFilePath = join(__dirname, '../tests/cars.json');
    const carsData = JSON.parse(readFileSync(carsFilePath, 'utf-8'));

    // Get all brands from database
    const brands = await queryInterface.sequelize.query(
      'SELECT id, name FROM car_brands',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create brand lookup map (normalized)
    const brandMap = new Map();
    brands.forEach(brand => {
      brandMap.set(normalizeString(brand.name), brand.id);
    });

    // Get all models from database
    const models = await queryInterface.sequelize.query(
      'SELECT id, brand_id, name FROM car_models WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create model lookup map (brand_id + normalized model name)
    const modelMap = new Map();
    models.forEach(model => {
      if (model.name && typeof model.name === 'string') {
        const key = `${model.brand_id}_${normalizeString(model.name)}`;
        modelMap.set(key, model.id);
      }
    });

    // Get existing variants from database
    const existingVariants = await queryInterface.sequelize.query(
      'SELECT brand_id, model_id, variant_name FROM car_variants WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create set of existing variants (brand_id + model_id + normalized variant name)
    const existingVariantsSet = new Set();
    existingVariants.forEach(variant => {
      if (variant.variant_name && typeof variant.variant_name === 'string') {
        existingVariantsSet.add(`${variant.brand_id}_${variant.model_id}_${normalizeString(variant.variant_name)}`);
      }
    });

    // Extract unique brand-model-variant combinations from cars data
    const uniqueVariants = new Map();
    
    carsData.forEach(car => {
      const normalizedBrand = normalizeString(car.brand);
      const normalizedModel = normalizeString(car.model);
      const normalizedVariant = normalizeString(car.variant);
      
      const brandId = brandMap.get(normalizedBrand);
      if (!brandId) {
        console.warn(`Brand not found: ${car.brand}`);
        return;
      }

      const modelKey = `${brandId}_${normalizedModel}`;
      const modelId = modelMap.get(modelKey);
      if (!modelId) {
        console.warn(`Model not found: ${car.brand} ${car.model}`);
        return;
      }

      const variantKey = `${brandId}_${modelId}_${normalizedVariant}`;
      
      // Skip if variant already exists in database
      if (existingVariantsSet.has(variantKey)) {
        return;
      }

      // Skip if already processed in this batch
      if (uniqueVariants.has(variantKey)) {
        return;
      }

      // Generate full name
      const fullName = `${car.brand} ${car.model} ${car.variant}`;

      uniqueVariants.set(variantKey, {
        brand_id: brandId,
        model_id: modelId,
        variant_name: car.variant, // Use original case from JSON
        slug: generateSlug(car.brand, car.model, car.variant),
        full_name: fullName,
        model_year: null,
        body_type: car.body_type || null,
        fuel_type: car.fuel_type || null,
        transmission_type: car.transmission_type || null,
        seating_capacity: car.seating_capacity || null,
        door_count: car.door_count || null,
        ex_showroom_price: null,
        price_range_min: null,
        price_range_max: null,
        is_active: true,
        is_discontinued: false,
        launch_date: null,
        discontinuation_date: null,
        primary_image_url: null,
        view_count: 0,
        listing_count: 0,
        popularity_score: 0,
        created_by: null,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
    });

    // Convert to array and insert
    const variantsToInsert = Array.from(uniqueVariants.values());

    if (variantsToInsert.length > 0) {
      console.log(`Inserting ${variantsToInsert.length} new car variants...`);
      await queryInterface.bulkInsert('car_variants', variantsToInsert);
      console.log('Car variants seeded successfully!');
    } else {
      console.log('No new car variants to insert.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('car_variants', null, {});
  }
};
