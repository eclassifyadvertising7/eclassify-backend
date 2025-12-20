import dotenv from 'dotenv';

dotenv.config();

/**
 * Test OTP signup without email (mobile only)
 */
async function testSignupWithoutEmail() {
  console.log('=== Testing OTP Signup Without Email ===\n');

  const testData = {
    mobile: '8002393939',
    otp: '123456', // Use a test OTP
    type: 'signup',
    fullName: 'Abhijit',
    countryCode: '+91',
    device_name: 'Test Device'
  };

  try {
    console.log('Testing OTP verify (signup) without email...');
    console.log('Request payload:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Signup without email successful!');
      console.log('User ID:', result.data?.user?.id);
      console.log('Email field:', result.data?.user?.email);
      console.log('Email verified:', result.data?.user?.isEmailVerified);
    } else {
      console.log('❌ Signup failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSignupWithoutEmail();