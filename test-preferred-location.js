import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Replace with a valid JWT token from your system
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testPreferredLocation() {
  console.log('🧪 Testing Preferred Location Endpoints\n');

  try {
    // Test 1: Get current preferred location
    console.log('1️⃣ Getting current preferred location...');
    const getResponse = await api.get('/profile/me/preferred-location');
    console.log('✅ GET /profile/me/preferred-location');
    console.log('Response:', JSON.stringify(getResponse.data, null, 2));
    console.log('');

    // Test 2: Update preferred location
    console.log('2️⃣ Updating preferred location...');
    const updateData = {
      preferredStateId: 1,
      preferredStateName: 'Maharashtra',
      preferredCityId: 5,
      preferredCityName: 'Pune',
      preferredLatitude: 18.5204,
      preferredLongitude: 73.8567
    };
    const updateResponse = await api.put('/profile/me/preferred-location', updateData);
    console.log('✅ PUT /profile/me/preferred-location');
    console.log('Response:', JSON.stringify(updateResponse.data, null, 2));
    console.log('');

    // Test 3: Get updated preferred location
    console.log('3️⃣ Getting updated preferred location...');
    const getUpdatedResponse = await api.get('/profile/me/preferred-location');
    console.log('✅ GET /profile/me/preferred-location (after update)');
    console.log('Response:', JSON.stringify(getUpdatedResponse.data, null, 2));
    console.log('');

    // Test 4: Partial update (only state and city name)
    console.log('4️⃣ Partial update (only state and city name)...');
    const partialUpdateData = {
      preferredStateId: 2,
      preferredStateName: 'Karnataka',
      preferredCityName: 'Bangalore'
    };
    const partialUpdateResponse = await api.put('/profile/me/preferred-location', partialUpdateData);
    console.log('✅ PUT /profile/me/preferred-location (partial)');
    console.log('Response:', JSON.stringify(partialUpdateResponse.data, null, 2));
    console.log('');

    // Test 5: Clear preferred location
    console.log('5️⃣ Clearing preferred location...');
    const clearData = {
      preferredStateId: null,
      preferredStateName: null,
      preferredCityId: null,
      preferredCityName: null,
      preferredLatitude: null,
      preferredLongitude: null
    };
    const clearResponse = await api.put('/profile/me/preferred-location', clearData);
    console.log('✅ PUT /profile/me/preferred-location (clear)');
    console.log('Response:', JSON.stringify(clearResponse.data, null, 2));
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Instructions
console.log('📝 Instructions:');
console.log('1. Make sure the server is running (npm run dev)');
console.log('2. Replace ACCESS_TOKEN with a valid JWT token');
console.log('3. Run: node test-preferred-location.js\n');

// Uncomment to run the test
// testPreferredLocation();
