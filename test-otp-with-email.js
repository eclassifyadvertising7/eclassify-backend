import dotenv from 'dotenv';

dotenv.config();

/**
 * Test OTP with personalized email functionality
 */
async function testOtpWithEmail() {
  console.log('=== Testing OTP with Personalized Email ===\n');

  const testData = {
    mobile: '9175113022',
    email: 'abhijit.abdagire5@gmail.com',
    fullName: 'Abhijit Abdagire',
    type: 'signup'
  };

  try {
    // Step 1: Send OTP with fullName
    console.log('Step 1: Sending OTP with personalized email...');
    const otpResponse = await fetch('http://localhost:5000/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const otpResult = await otpResponse.json();
    console.log('OTP Send Response:', JSON.stringify(otpResult, null, 2));

    if (otpResult.success) {
      console.log('✅ OTP sent successfully with personalized email!');
      console.log('📧 Check your email for personalized OTP message');
      
      // Note: In a real test, you would get the OTP from email/SMS and verify it
      console.log('\n📝 Next steps:');
      console.log('1. Check email for personalized OTP message');
      console.log('2. Use the OTP to verify and complete signup');
      console.log('3. Check email again for auto-generated password');
    } else {
      console.log('❌ Failed to send OTP:', otpResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOtpWithEmail();