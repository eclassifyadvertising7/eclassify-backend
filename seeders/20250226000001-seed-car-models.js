import { Sequelize } from 'sequelize';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateSlug = (brandName, modelName) => {
  // Ensure inputs are strings
  const brand = String(brandName || '');
  const model = String(modelName || '');
  
  // Replace + with 'plus' before converting to slug
  const normalizedModel = model.replace(/\+/g, '-plus');
  return `${brand}-${normalizedModel}`
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

    // Get existing models from database
    const existingModels = await queryInterface.sequelize.query(
      'SELECT brand_id, name FROM car_models WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create set of existing models (brand_id + normalized model name)
    const existingModelsSet = new Set();
    existingModels.forEach(model => {
      if (model.name && typeof model.name === 'string') {
        existingModelsSet.add(`${model.brand_id}_${normalizeString(model.name)}`);
      }
    });

    // Extract unique brand-model combinations from cars data
    const uniqueModels = new Map();
    
    carsData.forEach(car => {
      const normalizedBrand = normalizeString(car.brand);
      const normalizedModel = normalizeString(car.model);
      const brandId = brandMap.get(normalizedBrand);

      if (!brandId) {
        console.warn(`Brand not found: ${car.brand}`);
        return;
      }

      const modelKey = `${brandId}_${normalizedModel}`;
      
      // Skip if model already exists in database
      if (existingModelsSet.has(modelKey)) {
        return;
      }

      // Skip if already processed in this batch
      if (uniqueModels.has(modelKey)) {
        return;
      }

      uniqueModels.set(modelKey, {
        brand_id: brandId,
        name: car.model, // Use original case from JSON
        slug: generateSlug(car.brand, car.model),
        is_active: true,
        is_discontinued: false,
        launch_year: null,
        discontinuation_year: null,
        total_variants: 0,
        total_listings: 0,
        created_by: null,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
    });

    // Convert to array and insert
    const modelsToInsert = Array.from(uniqueModels.values());

    if (modelsToInsert.length > 0) {
      console.log(`Inserting ${modelsToInsert.length} new car models...`);
      await queryInterface.bulkInsert('car_models', modelsToInsert);
      console.log('Car models seeded successfully!');
    } else {
      console.log('No new car models to insert.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('car_models', null, {});
  }
};
