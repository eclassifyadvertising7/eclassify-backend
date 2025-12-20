import nodemailer from 'nodemailer';

async function testWithEthereal() {
  console.log('=== Testing with Ethereal Email (Test Service) ===\n');
  
  try {
    // Create test account with Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"EClassify Test" <test@eclassify.com>',
      to: 'abhijit.abdagire5@gmail.com',
      subject: 'Test Email from EClassify Backend',
      html: `
        <h2>EClassify Email Service Test</h2>
        <p>This is a test email to verify the email service is working.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Service: Ethereal Email (Test Service)</li>
          <li>Sent at: ${new Date().toISOString()}</li>
          <li>Backend: EClassify Node.js</li>
        </ul>
        <p>If you receive this, the email configuration is working correctly!</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\n📧 Note: This is a test email service. The email won\'t actually be delivered.');
    console.log('Use the preview URL above to see how the email looks.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithEthereal();