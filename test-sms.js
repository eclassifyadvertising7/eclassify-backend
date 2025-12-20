/**
 * Quick test script for SMS service
 * Run with: node test-sms.js
 */

import dotenv from 'dotenv';
import smsService from './src/services/smsService.js';

dotenv.config();



const testSms = async () => {
  console.log('Testing SMS Service...\n');
  
  // Test OTP generation
  const otp = smsService.generateOtp();
  console.log('Generated OTP:', otp);
  console.log('OTP Length:', otp.length);
  console.log('Is 6 digits:', /^\d{6}$/.test(otp));
  console.log('');
  
  // Test SMS sending (uncomment to actually send SMS)
  // WARNING: This will send a real SMS and may incur charges
  /*
  try {
    const mobile = '9175113022'; // Replace with your test mobile number
    const result = await smsService.sendOtp(mobile, otp);
    console.log('SMS Send Result:', result);
  } catch (error) {
    console.error('SMS Send Error:', error.message);
  }
  */
  
  console.log('\n✅ SMS Service test completed');
  console.log('\nNOTE: System now always generates random OTPs (no hardcoded values)');
  console.log('\nTo test actual SMS sending:');
  console.log('1. Uncomment the SMS sending code in test-sms.js');
  console.log('2. Replace the mobile number with your test number');
  console.log('3. Run: node test-sms.js');
};

testSms();
