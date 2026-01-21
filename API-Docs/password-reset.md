# Password Reset API Documentation

## Overview

Public endpoints for password reset functionality using OTP verification. Users can request a password reset OTP via email/SMS and reset their password using the OTP code.

## Endpoints

### 1. Forgot Password (Request Reset OTP)

**Endpoint:** `POST /api/auth/forgot-password`

**Access:** Public (no authentication required)

**Description:** Request a password reset OTP. System sends an OTP to the user's registered email or mobile number.

**Request Body:**
```json
{
  "username": "user@example.com"
}
```

**Parameters:**
- `username` (string, required): User's email address or mobile number (10 digits)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset OTP has been sent to your email",
  "data": {
    "email": "user@example.com",
    "channel": "email",
    "expiresAt": "2025-01-11T14:40:00.000Z"
  },
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**Success Response (Mobile - 200 OK):**
```json
{
  "success": true,
  "message": "Password reset OTP has been sent to your mobile",
  "data": {
    "email": null,
    "channel": "sms",
    "expiresAt": "2025-01-11T14:40:00.000Z"
  },
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**Response Fields:**
- `email`: User's registered email address (null if OTP sent via SMS)
- `channel`: Delivery channel used - "email" (if user has email) or "sms" (if no email)
- `expiresAt`: OTP expiration timestamp (10 minutes from generation)

**Note:** Mobile number is not included in response for security reasons.

**Error Responses:**

**400 Bad Request - Missing Identifier:**
```json
{
  "success": false,
  "message": "Email or mobile number is required",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Invalid Format:**
```json
{
  "success": false,
  "message": "Invalid email or mobile number format",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - User Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Account Suspended:**
```json
{
  "success": false,
  "message": "Your account has been suspended. Please contact support.",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

### 2. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Access:** Public (no authentication required)

**Description:** Reset user password using the OTP received via email/SMS.

**Request Body:**
```json
{
  "username": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Parameters:**
- `username` (string, required): User's email address or mobile number (10 digits)
- `otp` (string, required): 6-digit OTP code received via email/SMS
- `newPassword` (string, required): New password (minimum 6 characters)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "success": false,
  "message": "Required fields are missing",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Password Too Short:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Invalid Format:**
```json
{
  "success": false,
  "message": "Invalid email or mobile number format",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - Expired OTP:**
```json
{
  "success": false,
  "message": "OTP has expired",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

**400 Bad Request - No Active OTP:**
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "data": null,
  "timestamp": "2025-01-11T14:30:00.000Z"
}
```

## Flow Diagram

```
User                    Backend                     Email/SMS Service
  |                        |                              |
  |--forgot-password------>|                              |
  |   (username)           |                              |
  |                        |--Generate OTP--------------->|
  |                        |--Send OTP via Email/SMS----->|
  |<-----------------------|                              |
  |   (success message)    |                              |
  |                        |                              |
  |<--------------------OTP Code (6 digits)---------------|
  |                        |                              |
  |--reset-password------->|                              |
  |   (username+OTP+pass)  |                              |
  |                        |--Validate OTP--------------->|
  |                        |--Update Password------------>|
  |                        |--Invalidate All Sessions---->|
  |<-----------------------|                              |
  |   (success)            |                              |
```

## Security Features

1. **OTP Expiration:** OTPs expire after 10 minutes
2. **One-Time Use:** OTPs are marked as verified after successful password reset
3. **Session Invalidation:** All active user sessions are invalidated after password reset
4. **Old OTP Invalidation:** Previous unused OTPs are invalidated when new reset is requested
5. **Account Status Check:** Blocked/suspended accounts cannot request password reset
6. **Attempt Tracking:** Failed OTP verification attempts are tracked
7. **Secure OTP Generation:** Uses 6-digit random OTP

## Database Schema

**Table:** `otp_verifications`

Uses existing OTP verification table with `type = 'password_reset'`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| mobile | VARCHAR(15) | Mobile number (nullable) |
| email | VARCHAR(255) | Email address (nullable) |
| country_code | VARCHAR(5) | Country code for mobile |
| otp | VARCHAR(6) | 6-digit OTP code |
| type | ENUM | 'password_reset' for password reset |
| channel | ENUM | 'email' or 'sms' |
| is_verified | BOOLEAN | Whether OTP has been verified |
| verified_at | TIMESTAMP | When OTP was verified |
| expires_at | TIMESTAMP | OTP expiration time |
| attempts | SMALLINT | Failed verification attempts |
| resend_count | SMALLINT | Number of times OTP was resent |
| created_at | TIMESTAMP | OTP creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_otp_mobile_type_verified` on `(mobile, type, is_verified)`
- `idx_otp_email_type_verified` on `(email, type, is_verified)`
- `idx_otp_expires_at` on `expires_at`

## Email Template

The password reset OTP email includes:
- Personalized greeting with user's full name
- 6-digit OTP code prominently displayed
- Expiration notice (10 minutes)
- Security warning to ignore if not requested

## Environment Variables

Required configuration in `.env`:

```env
# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# App configuration
APP_NAME=EClassify
```

## Testing

**Test Forgot Password:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com"
  }'
```

**Test Reset Password:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "otp": "123456",
    "newPassword": "NewSecurePass123"
  }'
```

## Notes

- OTP expires after 10 minutes (configurable)
- Email or mobile number can be used as identifier
- **Channel Priority:** OTP is always sent via email if user has an email address registered, regardless of whether identifier is mobile or email. SMS is only used if user has no email.
- After successful reset, user must login again with new password
- Previous unused OTPs are automatically invalidated when requesting new OTP
- Failed OTP attempts are tracked for security monitoring
- **Security:** Response includes only email address (not mobile) to prevent information disclosure
