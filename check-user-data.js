import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUserData() {
  try {
    await client.connect();
    
    // Check mobile numbers and their lengths
    console.log('\n=== Checking User Mobile Numbers ===');
    const mobileQuery = await client.query(`
      SELECT 
        id,
        mobile, 
        LENGTH(mobile) as mobile_length,
        country_code,
        LENGTH(country_code) as cc_length,
        full_name,
        role_id
      FROM users 
      ORDER BY id
      LIMIT 10;
    `);
    console.table(mobileQuery.rows);
    
    // Check recent sessions with IP addresses
    console.log('\n=== Checking Recent Sessions ===');
    const sessionQuery = await client.query(`
      SELECT 
        id,
        user_id,
        ip_address_v4,
        LENGTH(ip_address_v4) as ip_length,
        device_name,
        created_at
      FROM user_sessions 
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    console.table(sessionQuery.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

checkUserData();
