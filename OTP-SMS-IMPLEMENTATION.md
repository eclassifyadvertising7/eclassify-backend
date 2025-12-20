# OTP SMS Production Implementation

## Overview

The OTP system has been upgraded from hardcoded development OTPs to production-ready SMS delivery using the Dovesoft SMS API.

## What Changed

### 1. New SMS Service (`src/services/smsService.js`)

**Features:**
- Random 6-digit OTP generation
- SMS sending via Dovesoft API
- Error handling and validation
- Support for custom SMS messages

**Methods:**
- `generateOtp()` - Generates random 6-digit OTP
- `sendOtp(mobile, otp)` - Sends OTP via SMS
- `sendMessage(mobile, message)` - Sends custom SMS

### 2. Updated OTP Service (`src/services/otpService.js`)

**Changes:**
- Imports `smsService` for SMS delivery
- Always generates random 6-digit OTP (no hardcoded values)
- Attempts SMS sending in all environments
- Console logging fallback in development only (if SMS fails)
- Production returns error if SMS fails

### 3. Environment Configuration

**New Variables (.env):**
```env
SMS_API_KEY=22b98dXX
SMS_SENDER_ID=wayshr
```

**Updated .env.example** with SMS configuration template

### 4. Dependencies

**Added:**
- `axios` - For HTTP requests to SMS API

**Installation:**
```bash
npm install axios
```

### 5. Updated Documentation

**API-Docs/otp-authentication.md:**
- Added SMS configuration section
- Updated testing instructions
- Changed OTP from `1234` to `123456`
- Added production vs development behavior notes

## SMS API Details

**Provider:** Dovesoft  
**Endpoint:** `https://api.dovesoft.io/api/sendsms`

**Parameters:**
- `key` - API key (from SMS_API_KEY env)
- `mobiles` - 10-digit mobile number
- `sms` - Message content (URL encoded)
- `senderid` - Sender ID (from SMS_SENDER_ID env)

**Message Format:**
```
Dear Customer,
Your verification code is {OTP}

Regards,
way2share
```

## How It Works

### All Environments (No Hardcoded OTPs)

1. User requests OTP
2. System generates random 6-digit OTP (e.g., `847392`)
3. System attempts to send SMS via Dovesoft API
4. **If SMS succeeds**: User receives SMS with OTP
5. **If SMS fails in development**: OTP logged to console as fallback
6. **If SMS fails in production**: Error returned to user
7. User enters OTP to verify

**Console Logs:**
- `[SMS] OTP sent to 9175113022` - SMS sent successfully
- `[FALLBACK] SMS OTP for 9175113022: 847392` - Development fallback only
- `SMS send failed: <error>` - SMS API error

## Testing

### Test OTP Generation

```bash
node test-sms.js
```

This will:
- Generate a random 6-digit OTP
- Validate format (6 digits)
- Show OTP in console

### Test SMS Sending (Optional)

1. Edit `test-sms.js`
2. Uncomment the SMS sending code
3. Replace mobile number with your test number
4. Run: `node test-sms.js`

**⚠️ Warning:** This will send a real SMS and may incur charges!

### Test via API

**Development:**
```bash
# Send OTP (check SMS or console for OTP if SMS fails)
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9175113022", "type": "signup"}'

# Verify with OTP from SMS or console
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9175113022", "otp": "847392", "type": "signup", "fullName": "Test User"}'
```

**Production:**
```bash
# Send OTP (SMS will be sent)
curl -X POST https://your-api.com/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9175113022", "type": "signup"}'

# Verify with OTP from SMS
curl -X POST https://your-api.com/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9175113022", "otp": "847392", "type": "signup", "fullName": "Test User"}'
```

## Error Handling

### SMS Service Errors

**Invalid Mobile Number:**
```json
{
  "success": false,
  "message": "Invalid mobile number format. Must be 10 digits"
}
```

**SMS API Failure:**
```json
{
  "success": false,
  "message": "Failed to send SMS. Please try again later"
}
```

**Network Timeout:**
- 10-second timeout on SMS API requests
- Returns generic error message (doesn't expose API details)

### OTP Service Errors

**SMS Send Failed:**
```json
{
  "success": false,
  "message": "Failed to send OTP"
}
```

## Security Features

1. **API Key Protection**
   - Stored in environment variables
   - Never exposed in responses or logs

2. **Error Message Sanitization**
   - Generic error messages to users
   - Detailed errors logged server-side only

3. **Timeout Protection**
   - 10-second timeout prevents hanging requests
   - Graceful failure handling

4. **Rate Limiting** (Existing)
   - 5 OTP requests per mobile per hour
   - 5 verification attempts per OTP

## Deployment Checklist

### Before Deploying to Production

- [ ] Update `SMS_API_KEY` with real API key
- [ ] Update `SMS_SENDER_ID` with approved sender ID
- [ ] Set `NODE_ENV=production`
- [ ] Test SMS sending with test mobile number
- [ ] Verify SMS delivery and message format
- [ ] Check SMS API rate limits and quotas
- [ ] Monitor SMS costs and usage
- [ ] Set up error alerting for SMS failures

### Environment Variables

**Required:**
```env
NODE_ENV=production
SMS_API_KEY=your-real-api-key
SMS_SENDER_ID=your-sender-id
```

**Optional (for testing):**
```env
NODE_ENV=development  # Uses hardcoded OTP
```

## Cost Considerations

**SMS Costs:**
- Each OTP request = 1 SMS
- Failed verifications don't send additional SMS
- Rate limiting prevents abuse (5 requests/hour/mobile)

**Optimization Tips:**
1. Use rate limiting to prevent spam
2. Implement OTP resend cooldown (e.g., 60 seconds)
3. Monitor failed SMS attempts
4. Consider email OTP as fallback (future)

## Future Enhancements

1. **SMS Delivery Status**
   - Track delivery status from Dovesoft API
   - Retry failed SMS automatically

2. **Multiple SMS Providers**
   - Fallback to secondary provider if primary fails
   - Load balancing across providers

3. **SMS Templates**
   - Configurable message templates
   - Multi-language support

4. **Analytics**
   - Track SMS success/failure rates
   - Monitor delivery times
   - Cost tracking per user/campaign

5. **Resend Endpoint**
   - Dedicated endpoint for OTP resend
   - Cooldown period between resends

## Troubleshooting

### OTP Not Received

**Check:**
1. Mobile number format (must be 10 digits)
2. SMS API credentials in .env
3. Server logs for SMS errors
4. Dovesoft API status
5. Network connectivity

**Console Logs:**
```
[SMS] OTP sent to 9175113022                    # SMS sent successfully
[FALLBACK] SMS OTP for 9175113022: 847392      # Development fallback only
SMS send failed: <error details>               # SMS API error
```

### SMS API Errors

**Common Issues:**
- Invalid API key → Check `SMS_API_KEY`
- Invalid sender ID → Check `SMS_SENDER_ID`
- Network timeout → Check internet connection
- Rate limit exceeded → Contact Dovesoft support

### Development Testing

**Issue:** Want to test without sending SMS  
**Solution:** Disconnect internet or use invalid SMS credentials to trigger console fallback in development

**Issue:** Need to test actual SMS  
**Solution:** Use valid SMS credentials and test with real mobile number

## Support

**Dovesoft API Documentation:**
- Contact Dovesoft support for API docs
- Check rate limits and quotas
- Verify sender ID approval status

**Project Issues:**
- Check server logs for detailed errors
- Verify environment variables are set
- Test with `test-sms.js` script

## Summary

✅ **Completed:**
- SMS service implementation
- Random OTP generation (no hardcoded values)
- SMS sending in all environments
- Development fallback logging
- Error handling and validation
- Documentation updates
- Test script

🎯 **Ready for Production:**
- Update SMS_API_KEY with real key
- Deploy and test with real mobile number
- System works the same in all environments
