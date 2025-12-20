/**
 * Simple test to verify Google OAuth configuration
 * Run with: node test-google-oauth.js
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing Google OAuth Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_CALLBACK_URL',
  'CORS_ORIGIN'
];

let configValid = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value || value === 'your-google-client-id' || value === 'your-google-client-secret') {
    console.log(`❌ ${envVar}: Missing or not configured`);
    configValid = false;
  } else {
    console.log(`✅ ${envVar}: Configured`);
  }
});

console.log('\n📋 Google OAuth Endpoints:');
console.log(`🔗 Initiate OAuth: GET ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/google`);
console.log(`🔗 OAuth Callback: GET ${process.env.GOOGLE_CALLBACK_URL}`);
console.log(`🔗 Complete Profile: POST ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/google/complete-profile`);

console.log('\n🎯 Frontend Integration:');
console.log(`📱 Redirect URL: ${process.env.CORS_ORIGIN}/auth/callback`);
console.log(`❌ Error URL: ${process.env.CORS_ORIGIN}/auth/error`);

if (configValid) {
  console.log('\n✅ Google OAuth configuration looks good!');
  console.log('\n📝 Next steps:');
  console.log('1. Set up Google Cloud Console project');
  console.log('2. Enable Google+ API');
  console.log('3. Create OAuth 2.0 credentials');
  console.log('4. Add authorized redirect URIs');
  console.log('5. Update .env with actual Google credentials');
  console.log('6. Test the OAuth flow');
} else {
  console.log('\n❌ Please configure missing environment variables in .env file');
}

console.log('\n🔧 Google Cloud Console Setup:');
console.log('- Project: Create new project or use existing');
console.log('- APIs: Enable Google+ API');
console.log('- Credentials: Create OAuth 2.0 client ID');
console.log('- Authorized redirect URIs:');
console.log(`  - ${process.env.GOOGLE_CALLBACK_URL}`);
console.log('- Authorized JavaScript origins:');
console.log(`  - ${process.env.CORS_ORIGIN}`);