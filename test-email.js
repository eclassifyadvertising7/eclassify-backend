import dotenv from 'dotenv';
import emailService from './src/services/emailService.js';

// Load environment variables
dotenv.config();

/**
 * Test Gmail SMTP configuration
 */
async function testEmailService() {
  console.log('=== Gmail SMTP Configuration Test ===\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log();

  // Test 1: Verify SMTP connection
  console.log('Test 1: Verifying SMTP connection...');
  const isConnected = await emailService.verifyConnection();
  
  if (!isConnected) {
    console.error('❌ SMTP connection failed!');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have enabled 2-Factor Authentication on your Gmail account');
    console.log('2. Generate an App Password from Google Account settings > Security > App passwords');
    console.log('3. Use the 16-character app password (not your regular Gmail password)');
    console.log('4. Update EMAIL_USER and EMAIL_PASSWORD in your .env file');
    process.exit(1);
  }
  
  console.log('✅ SMTP connection verified successfully!\n');

  // Test 2: Send OTP email
  const testEmail = 'abhijit.abdagire5@gmail.com'; // Send to specified email
  
  console.log(`Test 2: Sending OTP email to ${testEmail}...`);
  const otpSent = await emailService.sendOtp(testEmail, '123456', 'signup');
  
  if (otpSent) {
    console.log('✅ OTP email sent successfully!');
  } else {
    console.log('❌ Failed to send OTP email');
  }
  console.log();

  // Test 3: Send notification email
  console.log(`Test 3: Sending notification email to ${testEmail}...`);
  const notificationSent = await emailService.sendNotification(
    testEmail,
    'Test Notification',
    'This is a test notification from EClassify.',
    {
      actionUrl: 'http://localhost:3000',
      actionText: 'View Dashboard'
    }
  );
  
  if (notificationSent) {
    console.log('✅ Notification email sent successfully!');
  } else {
    console.log('❌ Failed to send notification email');
  }
  console.log();

  // Test 4: Send welcome email
  console.log(`Test 4: Sending welcome email to ${testEmail}...`);
  const welcomeSent = await emailService.sendWelcomeEmail(testEmail, 'Test User');
  
  if (welcomeSent) {
    console.log('✅ Welcome email sent successfully!');
  } else {
    console.log('❌ Failed to send welcome email');
  }
  console.log();

  console.log('=== Test Complete ===');
  console.log('\nCheck your inbox for the test emails!');
  console.log('Note: Gmail may take a few seconds to deliver the emails.');
  
  process.exit(0);
}

// Run the test
testEmailService().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});