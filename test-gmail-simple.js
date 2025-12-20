import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testGmailAuth() {
  console.log('=== Simple Gmail Authentication Test ===\n');
  
  console.log('Configuration:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0);
  console.log('EMAIL_PASSWORD (masked):', process.env.EMAIL_PASSWORD ? 
    process.env.EMAIL_PASSWORD.substring(0, 4) + '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'Not set');
  console.log();

  // Create transporter with exact Gmail settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service instead of manual SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ Gmail authentication successful!');
    
    // Send test email
    console.log('\nSending test email to abhijit.abdagire5@gmail.com...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'abhijit.abdagire5@gmail.com',
      subject: 'Test Email from EClassify',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from EClassify backend.</p>
        <p>If you receive this, the email service is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail authentication failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Verify 2-Factor Authentication is enabled on Gmail');
      console.log('2. Generate a new App Password:');
      console.log('   - Go to Google Account settings');
      console.log('   - Security > 2-Step Verification > App passwords');
      console.log('   - Generate password for "Mail"');
      console.log('3. Update EMAIL_PASSWORD in .env with the 16-character app password');
      console.log('4. Make sure no spaces in the app password');
      console.log('5. Restart the application after updating .env');
    }
  }
  
  process.exit(0);
}

testGmailAuth().catch(console.error);