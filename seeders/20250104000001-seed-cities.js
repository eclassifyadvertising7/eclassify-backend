import { Sequelize } from 'sequelize';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateSlug = (cityName, stateName, pincode) => {
  // Ensure inputs are strings
  const city = String(cityName || '');
  const state = String(stateName || '');
  const pin = String(pincode || '');
  
  return `${city}-${state}-${pin}`
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
    // Read state cities data from JSON file
    const citiesFilePath = join(__dirname, '../data/stateCitiesDataNew.json');
    const citiesData = JSON.parse(readFileSync(citiesFilePath, 'utf-8'));

    // Get all states from database
    const states = await queryInterface.sequelize.query(
      'SELECT id, slug, name FROM states WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create state lookup map by slug (normalized)
    const stateMap = new Map();
    states.forEach(state => {
      stateMap.set(normalizeString(state.slug), {
        id: state.id,
        name: state.name
      });
    });

    // Get existing cities from database
    const existingCities = await queryInterface.sequelize.query(
      'SELECT state_id, name, pincode FROM cities WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create set of existing cities (state_id + normalized city name + pincode)
    const existingCitiesSet = new Set();
    existingCities.forEach(city => {
      if (city.name && typeof city.name === 'string') {
        const key = `${city.state_id}_${normalizeString(city.name)}_${city.pincode || ''}`;
        existingCitiesSet.add(key);
      }
    });

    // Extract unique cities from JSON data
    const uniqueCities = new Map();
    
    citiesData.forEach(cityData => {
      const normalizedStateSlug = normalizeString(cityData.state_slug);
      const normalizedCityName = normalizeString(cityData.city);
      
      const stateInfo = stateMap.get(normalizedStateSlug);
      if (!stateInfo) {
        console.warn(`State not found for slug: ${cityData.state_slug}`);
        return;
      }

      // Skip cities with "N/A" or "NA" as name (all variations)
      if (normalizedCityName === 'n/a' || normalizedCityName === 'na') {
        return;
      }

      const cityKey = `${stateInfo.id}_${normalizedCityName}_${cityData.pincode || ''}`;
      
      // Skip if city already exists in database
      if (existingCitiesSet.has(cityKey)) {
        return;
      }

      // Skip if already processed in this batch
      if (uniqueCities.has(cityKey)) {
        return;
      }

      uniqueCities.set(cityKey, {
        slug: generateSlug(cityData.city, cityData.state_slug, cityData.pincode),
        name: cityData.city, // Use original case from JSON
        state_id: stateInfo.id,
        district_id: null, // Will be populated later if districts are seeded
        state_name: stateInfo.name,
        district: null,
        locality: cityData.locality && cityData.locality.trim() !== '' ? cityData.locality : null,
        pincode: cityData.pincode || null,
        latitude: cityData.latitude ? parseFloat(cityData.latitude) : null,
        longitude: cityData.longitude ? parseFloat(cityData.longitude) : null,
        is_active: true,
        display_order: 0,
        created_by: null,
        updated_by: null,
        is_deleted: false,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
    });

    // Convert to array and insert in batches
    const citiesToInsert = Array.from(uniqueCities.values());

    if (citiesToInsert.length > 0) {
      console.log(`Inserting ${citiesToInsert.length} new cities in batches...`);
      
      const batchSize = 1000; // Insert 1000 cities at a time
      for (let i = 0; i < citiesToInsert.length; i += batchSize) {
        const batch = citiesToInsert.slice(i, i + batchSize);
        await queryInterface.bulkInsert('cities', batch);
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(citiesToInsert.length / batchSize)} (${batch.length} cities)`);
      }
      
      console.log('Cities seeded successfully!');
    } else {
      console.log('No new cities to insert.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('cities', null, {});
  }
};
