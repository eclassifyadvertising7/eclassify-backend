import { Sequelize } from 'sequelize';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const updateCitiesLocality = async () => {
  try {
    console.log('Starting locality update process...\n');

    const citiesFilePath = join(__dirname, 'data/stateCitiesDataNew.json');
    const citiesData = JSON.parse(readFileSync(citiesFilePath, 'utf-8'));

    console.log(`Loaded ${citiesData.length} records from JSON file\n`);

    const localityMap = new Map();
    
    citiesData.forEach(cityData => {
      if (cityData.pincode && cityData.locality && cityData.locality.trim() !== '') {
        if (!localityMap.has(cityData.pincode)) {
          localityMap.set(cityData.pincode, cityData.locality.trim());
        }
      }
    });

    console.log(`Found ${localityMap.size} unique pincodes with locality data\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const batchSize = 100;
    const entries = Array.from(localityMap.entries());
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      for (const [pincode, locality] of batch) {
        try {
          const [affectedRows] = await sequelize.query(
            `UPDATE cities 
             SET locality = :locality, 
                 updated_at = NOW() 
             WHERE pincode = :pincode 
             AND (locality IS NULL OR locality = '')`,
            {
              replacements: { pincode, locality },
              type: Sequelize.QueryTypes.UPDATE
            }
          );

          if (affectedRows > 0) {
            updatedCount += affectedRows;
            console.log(`✓ Updated ${affectedRows} city(ies) for pincode: ${pincode}`);
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`✗ Error updating pincode ${pincode}:`, error.message);
        }
      }

      console.log(`\nProcessed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}\n`);
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total records in JSON: ${citiesData.length}`);
    console.log(`Unique pincodes with locality: ${localityMap.size}`);
    console.log(`Cities updated: ${updatedCount}`);
    console.log(`Skipped (already has locality): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('======================\n');

    console.log('Locality update completed successfully!');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

updateCitiesLocality();
