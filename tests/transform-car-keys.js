import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Key mapping: old key → new key (trimmed for comparison)
const KEY_MAPPING = {
  'Ex-Showroom_Price': 'ex_showroom_price',
  'Displacement': 'displacement_cc',
  'Cylinders': 'cylinder_count',
  'Valves_Per_Cylinder': 'valves_per_cylinder',
  'Drivetrain': 'drivetrain_type',
  'Emission_Norm': 'emission_standard',
  'Engine_Location': 'engine_location',
  'Fuel_System': 'fuel_injection_type',
  'Fuel_Tank_Capacity': 'fuel_tank_capacity',
  'Fuel_Type': 'fuel_type',
  'Height': 'height_mm',
  'Length': 'length_mm',
  'Width': 'width_mm',
  'Body_Type': 'body_type',
  'Doors': 'door_count',
  'City_Mileage': 'mileage_city',
  'Highway_Mileage': 'mileage_highway',
  'ARAI_Certified_Mileage': 'mileage_arai',
  'Kerb_Weight': 'kerb_weight',
  'Gears': 'gear_count',
  'Ground_Clearance': 'ground_clearance',
  'Front_Brakes': 'front_brake_type',
  'Rear_Brakes': 'rear_brake_type',
  'Front_Suspension': 'front_suspension_type',
  'Rear_Suspension': 'rear_suspension_type',
  'Front_Tyre_&_Rim': 'front_tyre_size',
  'Rear_Tyre_&_Rim': 'rear_tyre_size',
  'Power_Steering': 'power_steering',
  'Power_Windows': 'power_windows',
  'Power': 'max_power',
  'Torque': 'max_torque',
  'Odometer': 'odometer_type',
  'Speedometer': 'speedometer_type',
  'Seating_Capacity': 'seating_capacity',
  'Type': 'transmission_type',
  'Wheelbase': 'wheel_base',
  'Wheels_Size': 'wheel_size'
};

// Create a trimmed key lookup map for case-insensitive matching
const createTrimmedKeyMap = () => {
  const map = new Map();
  for (const [oldKey, newKey] of Object.entries(KEY_MAPPING)) {
    map.set(oldKey.trim().toLowerCase(), newKey);
  }
  return map;
};

const trimmedKeyMap = createTrimmedKeyMap();

/**
 * Find the new key for a given old key (with trimming and case-insensitive matching)
 */
const findNewKey = (key) => {
  if (!key || typeof key !== 'string') return key;
  
  const trimmedKey = key.trim();
  const lowerKey = trimmedKey.toLowerCase();
  
  // Try exact match first
  if (KEY_MAPPING[trimmedKey]) {
    return KEY_MAPPING[trimmedKey];
  }
  
  // Try case-insensitive match
  if (trimmedKeyMap.has(lowerKey)) {
    return trimmedKeyMap.get(lowerKey);
  }
  
  // Return original trimmed key if no mapping found
  return trimmedKey;
};

/**
 * Transform object keys recursively
 */
const transformKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const transformed = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = findNewKey(key);
      transformed[newKey] = transformKeys(value);
    }
    
    return transformed;
  }
  
  return obj;
};

/**
 * Main transformation function
 */
const transformCarData = () => {
  const inputPath = path.join(__dirname, 'cars.json');
  const outputPath = path.join(__dirname, 'cars-transformed.json');
  
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Error: cars.json not found in tests folder');
      console.log('📝 Please place your cars.json file in the tests folder');
      return;
    }
    
    // Read the JSON file
    console.log('📖 Reading cars.json...');
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Transform the keys
    console.log('🔄 Transforming keys...');
    const transformedData = transformKeys(data);
    
    // Write the transformed data
    console.log('💾 Writing transformed data...');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(transformedData, null, 2),
      'utf8'
    );
    
    // Generate statistics
    const keysInMapping = Object.keys(KEY_MAPPING).length;
    const dataSize = Array.isArray(transformedData) 
      ? transformedData.length 
      : Object.keys(transformedData).length;
    
    console.log('\n✅ Transformation complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Keys in mapping: ${keysInMapping}`);
    console.log(`   - Records processed: ${dataSize}`);
    console.log(`   - Output file: ${outputPath}`);
    console.log('\n💡 Note: Keys are trimmed and matched case-insensitively');
    console.log('   Unmapped keys are preserved with trimmed whitespace');
    
  } catch (error) {
    console.error('❌ Error during transformation:', error.message);
    process.exit(1);
  }
};

// Run the transformation
transformCarData();
