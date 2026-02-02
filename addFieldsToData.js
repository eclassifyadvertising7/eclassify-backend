import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const inputFile = path.join(__dirname, 'data', 'stateCitiesDataOne.json');
const outputFile = path.join(__dirname, 'data', 'stateCitiesDataOne.json');
const backupFile = path.join(__dirname, 'data', 'stateCitiesData.backup.json');

// Function to create slug from string
function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Main function to add fields
async function addFieldsToRecords() {
  try {
    console.log('Reading JSON file...');
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(fileContent);

    console.log(`Total records found: ${data.length}`);

    // Create backup
    console.log('Creating backup...');
    fs.writeFileSync(backupFile, fileContent, 'utf8');
    console.log(`Backup created at: ${backupFile}`);

    // Add new fields to each record
    console.log('Adding new fields to records...');
    const updatedData = data.map((record, index) => {
      return {
        ...record,
        locality: record.locality || null,
        district_slug: record.city ? createSlug(record.city) : null,
        is_verified: record.is_verified !== undefined ? record.is_verified : false
      };
    });

    // Write updated data back to file
    console.log('Writing updated data to file...');
    fs.writeFileSync(outputFile, JSON.stringify(updatedData, null, 2), 'utf8');

    console.log('✓ Task completed successfully!');
    console.log(`✓ Updated ${updatedData.length} records`);
    console.log(`✓ Added fields: locality, district_slug, is_verified`);
    console.log(`✓ Output file: ${outputFile}`);

  } catch (error) {
    console.error('Error occurred:', error.message);
    process.exit(1);
  }
}

// Run the script
addFieldsToRecords();
