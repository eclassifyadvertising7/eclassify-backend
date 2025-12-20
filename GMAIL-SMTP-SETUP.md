# Gmail SMTP Setup Guide

This guide explains how to configure Gmail SMTP for sending emails in the EClassify application.

## Prerequisites

- Gmail account
- 2-Factor Authentication enabled on Gmail
- App Password generated for the application

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** tab
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### 2. Generate App Password

1. In Google Account settings, go to **Security**
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** from the dropdown
4. Click **Generate**
5. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 3. Update Environment Variables

Update your `.env` file with the following configuration:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-gmail@gmail.com
EMAIL_SECURE=false
```

**Important Notes:**
- Use your actual Gmail address for `EMAIL_USER` and `EMAIL_FROM`
- Use the 16-character app password (NOT your regular Gmail password)
- Remove spaces from the app password when copying

### 4. Test the Configuration

Run the test script to verify your setup:

```bash
node test-email.js
```

This will:
- Verify SMTP connection
- Send test OTP email
- Send test notification email
- Send test welcome email

## Email Service Features

The email service provides the following functionality:

### OTP Emails
- Signup verification
- Login verification
- Password reset
- Account verification

### Notification Emails
- System notifications
- User activity alerts
- Subscription updates
- Security alerts

### Welcome Emails
- New user onboarding
- Account activation confirmation

## Usage Examples

### Send OTP Email
```javascript
import emailService from '#services/emailService.js';

// Send signup OTP
await emailService.sendOtp('user@example.com', '123456', 'signup');

// Send login OTP
await emailService.sendOtp('user@example.com', '654321', 'login');
```

### Send Notification Email
```javascript
await emailService.sendNotification(
  'user@example.com',
  'Listing Approved',
  'Your listing has been approved and is now live.',
  {
    actionUrl: 'http://localhost:3000/listings/123',
    actionText: 'View Listing'
  }
);
```

### Send Welcome Email
```javascript
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure 2FA is enabled
   - Use app password, not regular password
   - Check EMAIL_USER is correct Gmail address

2. **"Connection timeout" error**
   - Check internet connection
   - Verify EMAIL_HOST and EMAIL_PORT
   - Try EMAIL_PORT=465 with EMAIL_SECURE=true

3. **"Authentication failed" error**
   - Regenerate app password
   - Remove spaces from app password
   - Ensure EMAIL_USER matches the Gmail account

### Alternative SMTP Settings

If port 587 doesn't work, try:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Gmail Security Settings

If you still have issues:
1. Check [Less secure app access](https://myaccount.google.com/lesssecureapps) (should be OFF)
2. Verify [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification) is ON
3. Generate a new [App Password](https://myaccount.google.com/apppasswords)

## Production Considerations

### Rate Limits
- Gmail has sending limits (500 emails/day for free accounts)
- Consider using dedicated email services for high volume:
  - SendGrid
  - Mailgun
  - Amazon SES

### Security
- Never commit real credentials to version control
- Use environment variables for all sensitive data
- Rotate app passwords regularly

### Monitoring
- Monitor email delivery success rates
- Log failed email attempts
- Set up alerts for email service failures

## Integration with Application

The email service is automatically integrated with:

### OTP Service
- Email OTP sending for signup/login
- Automatic fallback to console logging in development

### Notification Service
- User notification delivery via email
- Delivery status tracking

### User Registration
- Welcome email sending (can be added to auth service)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | 16-character app password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | From address for emails | `your-email@gmail.com` |
| `EMAIL_SECURE` | Use SSL/TLS | `false` for port 587 |

## Next Steps

1. Configure your Gmail account following this guide
2. Update your `.env` file with the correct credentials
3. Run `node test-email.js` to verify the setup
4. Check your inbox for test emails
5. Start using email functionality in your application

The email service is now ready to use throughout your EClassify application!