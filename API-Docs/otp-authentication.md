# OTP-Based Authentication API Documentation

## Overview

OTP-based authentication allows users to sign up, log in, and verify their mobile number without requiring a password. The system always generates random 6-digit OTPs and sends them via SMS.

**Key Features:**
- Passwordless authentication via OTP
- Always random 6-digit OTP generation (no hardcoded values)
- SMS delivery via Dovesoft API
- Console logging in development (with SMS fallback on failure)
- Independent mobile number verification
- Auto-generated password for OTP-based signups (stored securely)
- Phone number verification on successful OTP verification
- 10-minute OTP expiration
- Maximum 5 verification attempts per OTP
- Supports signup, login, and verification flows

---

## Endpoints

### 1. Send OTP

Send OTP to a mobile number for signup or login.

**Endpoint:** `POST /api/auth/otp/send`

**Access:** Public

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body Examples:**

**Request Body (Both mobile and email required):**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "countryCode": "+91",
  "type": "signup",
  "fullName": "John Doe"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mobile | string | Conditional | 10-digit mobile number (required for SMS channel) |
| email | string | Conditional | Valid email address (required for email channel) |
| countryCode | string | No | Country code (default: +91, only for mobile) |
| type | string | Yes | Type of OTP: `signup`, `login`, or `verification` |
| channel | string | No | Delivery channel: `sms`, `email`, `whatsapp` (default: sms) |
| fullName | string | No | User's full name (used for personalized emails, fallback: "Customer") |

**Validation Rules:**
- **For SMS**: `mobile` must be exactly 10 digits
- **For Email**: `email` must be valid email format
- `type`: Must be one of: `signup`, `login`, `verification`
- `channel`: Must be one of: `sms`, `email`, `whatsapp`
- **For signup/login**: Contact method must exist/not exist in database accordingly
- **For verification**: No user existence check (can verify any mobile/email)

**Rate Limiting:**
- Maximum 5 OTP requests per IP address per hour
- Maximum 3 resends per mobile number per session (10 minutes)

**Success Response Examples:**

**For Mobile OTP (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobile": "9175113022",
    "countryCode": "+91",
    "type": "signup",
    "channel": "sms",
    "expiresIn": 600
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**For Email OTP (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "type": "verification",
    "channel": "email",
    "expiresIn": 600
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**Response Fields:**
- `expiresIn`: OTP validity in seconds (600 = 10 minutes)

**Error Responses:**

**400 Bad Request - Invalid Phone Format:**
```json
{
  "success": false,
  "message": "Invalid phone number format",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Mobile Already Registered (signup):**
```json
{
  "success": false,
  "message": "Mobile number already registered. Please use login instead",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Mobile Not Registered (login):**
```json
{
  "success": false,
  "message": "Mobile number not registered. Please sign up first",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Invalid Type:**
```json
{
  "success": false,
  "message": "Invalid OTP type. Must be signup, login, or verification",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**429 Too Many Requests - IP Rate Limit:**
```json
{
  "success": false,
  "message": "Too many OTP requests from this IP. Please try again later",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**429 Too Many Requests - Resend Limit:**
```json
{
  "success": false,
  "message": "Maximum OTP resend limit reached. Please try again later",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

---

### 2. Verify OTP - Unified Endpoint

Unified endpoint for OTP verification that handles signup, login, and verification flows based on the `type` parameter.

**Endpoint:** `POST /api/auth/otp/verify`

**Access:** Public

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body Examples:**

**For Signup:**
```json
{
  "mobile": "9175113022",
  "otp": "1234",
  "type": "signup",
  "fullName": "John Doe",
  "countryCode": "+91",
  "device_name": "iPhone 14 Pro"
}
```

**For Login:**
```json
{
  "mobile": "9175113022",
  "otp": "1234",
  "type": "login",
  "device_name": "iPhone 14 Pro"
}
```

**For Mobile Verification:**
```json
{
  "mobile": "9175113022",
  "otp": "1234",
  "type": "verification"
}
```

**For Email Verification:**
```json
{
  "email": "user@example.com",
  "otp": "1234",
  "type": "verification"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mobile | string | Conditional | 10-digit mobile number (required for mobile OTP) |
| email | string | Conditional | Valid email address (required for email OTP) |
| otp | string | Yes | OTP code (1234 for development) |
| type | string | Yes | `signup`, `login`, or `verification` |
| fullName | string | Conditional | Required only for `type: "signup"` (min 2 characters) |
| countryCode | string | No | Country code (default: +91, only for mobile) |
| device_name | string | No | Device name for session tracking (not used for verification) |

**Note:** Provide either `mobile` OR `email`, not both. For signup/login, currently only mobile is supported.

**Success Responses:**

**For Signup (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9175113022",
      "countryCode": "+91",
      "email": null,
      "role": "user",
      "profile_image": null,
      "last_login_at": null,
      "isPhoneVerified": true,
      "isEmailVerified": false
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 86400
    },
    "authMethod": "otp"
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**For Login (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9175113022",
      "countryCode": "+91",
      "email": "john@example.com",
      "role": "user",
      "profile_image": "http://localhost:5000/uploads/profiles/user-123/photo.jpg",
      "last_login_at": "2025-12-08T10:30:00.000Z",
      "isPhoneVerified": true,
      "isEmailVerified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 86400
    },
    "authMethod": "otp"
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**For Mobile Verification (200 OK):**
```json
{
  "success": true,
  "message": "Mobile number verified successfully",
  "data": {
    "mobile": "9175113022",
    "verified": true
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**For Email Verification (200 OK):**
```json
{
  "success": true,
  "message": "Email address verified successfully",
  "data": {
    "email": "user@example.com",
    "verified": true
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**Important Notes:**
- **Signup**: 8-digit alphanumeric password is auto-generated and stored securely, phone and email are automatically verified, JWT tokens provided
- **Password Email**: If email is provided during signup, an 8-digit alphanumeric password is automatically sent to the user's email address
- **Login**: Existing user authentication with JWT tokens
- **Verification**: Pure verification without authentication or token generation

---

### 3. Common Error Responses

**400 Bad Request - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Missing required fields",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Full Name Required (Signup):**
```json
{
  "success": false,
  "message": "Full name is required for signup and must be at least 2 characters",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - OTP Not Found:**
```json
{
  "success": false,
  "message": "OTP not found or already verified",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - OTP Expired:**
```json
{
  "success": false,
  "message": "OTP has expired",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Max Attempts Exceeded:**
```json
{
  "success": false,
  "message": "Maximum OTP verification attempts exceeded",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - User Not Found (Login):**
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**400 Bad Request - Account Suspended:**
```json
{
  "success": false,
  "message": "Account has been suspended",
  "data": null,
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

---

## Frontend Integration

### How Frontend Identifies OTP vs Password Auth

The frontend determines authentication method based on user choice:

**Option 1: Use separate UI flows**
```javascript
// Signup with OTP
const signupWithOtp = async (mobile, fullName) => {
  // Step 1: Send OTP
  const otpResponse = await fetch('/api/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: mobile,
      type: 'signup'
    })
  });

  // Step 2: User enters OTP, then verify
  const verifyResponse = await fetch('/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: mobile,
      otp: userEnteredOtp,
      type: 'signup',
      fullName: fullName
    })
  });
};

// Signup with Password
const signupWithPassword = async (mobile, fullName, password) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: mobile,
      fullName: fullName,
      password: password
    })
  });
};
```

**Option 2: Toggle in UI**
```javascript
// User selects "Sign up with OTP" or "Sign up with Password"
const [authMethod, setAuthMethod] = useState('otp'); // or 'password'

if (authMethod === 'otp') {
  // Show OTP flow (mobile + fullName, then OTP input)
} else {
  // Show password flow (mobile + fullName + password)
}
```

### Complete React Example (OTP Signup)

```javascript
import { useState } from 'react';

const OtpSignup = () => {
  const [step, setStep] = useState(1); // 1: Enter details, 2: Enter OTP
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile,
          type: 'signup'
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(2); // Move to OTP input step
        // OTP is sent via SMS (hardcoded 1234 for development)
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile,
          otp: otp,
          type: 'signup',
          fullName: fullName,
          device_name: navigator.userAgent
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        localStorage.setItem('access_token', data.data.tokens.access_token);
        localStorage.setItem('refresh_token', data.data.tokens.refresh_token);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Sign Up with OTP</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
          />
          <button onClick={sendOtp} disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Enter OTP</h2>
          <p>OTP sent to {mobile}</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={4}
          />
          <button onClick={verifyOtp} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button onClick={() => setStep(1)}>Change Number</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### Complete React Example (OTP Login)

```javascript
import { useState } from 'react';

const OtpLogin = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile,
          type: 'login'
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile,
          otp: otp,
          type: 'login',
          device_name: navigator.userAgent
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.data.tokens.access_token);
        localStorage.setItem('refresh_token', data.data.tokens.refresh_token);
        window.location.href = '/dashboard';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Login with OTP</h2>
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
          />
          <button onClick={sendOtp} disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Enter OTP</h2>
          <p>OTP sent to {mobile}</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={4}
          />
          <button onClick={verifyOtp} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button onClick={() => setStep(1)}>Change Number</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

---

## Authentication Flow Comparison

### OTP-Based Signup Flow
1. User enters mobile number and full name
2. Frontend calls `POST /api/auth/otp/send` with `type: "signup"`
3. Backend sends OTP (hardcoded 1234)
4. User enters OTP
5. Frontend calls `POST /api/auth/otp/verify` with mobile, OTP, `type: "signup"`, and fullName
6. Backend creates user with auto-generated password
7. Backend returns user data and JWT tokens
8. User is logged in

### OTP-Based Login Flow
1. User enters mobile number
2. Frontend calls `POST /api/auth/otp/send` with `type: "login"`
3. Backend sends OTP (hardcoded 1234)
4. User enters OTP
5. Frontend calls `POST /api/auth/otp/verify` with mobile, OTP, and `type: "login"`
6. Backend verifies user and OTP
7. Backend returns user data and JWT tokens
8. User is logged in

### OTP-Based Mobile Verification Flow
1. User enters mobile number (for profile update, 2FA, etc.)
2. Frontend calls `POST /api/auth/otp/send` with `type: "verification"`
3. Backend sends OTP (hardcoded 1234)
4. User enters OTP
5. Frontend calls `POST /api/auth/otp/verify` with mobile, OTP, and `type: "verification"`
6. Backend verifies OTP only (no authentication)
7. Backend returns verification confirmation
8. Frontend proceeds with intended action (profile update, etc.)

### OTP-Based Email Verification Flow
1. User enters email address (for profile update, email verification, etc.)
2. Frontend calls `POST /api/auth/otp/send` with `email`, `type: "verification"`, and `channel: "email"`
3. Backend sends OTP to email (hardcoded 1234)
4. User enters OTP from email
5. Frontend calls `POST /api/auth/otp/verify` with email, OTP, and `type: "verification"`
6. Backend verifies OTP only (no authentication)
7. Backend returns verification confirmation
8. Frontend proceeds with intended action (email verification, etc.)

### Password-Based Signup Flow (Existing)
1. User enters mobile, full name, and password
2. Frontend calls `POST /api/auth/signup`
3. Backend creates user with provided password
4. Backend returns user data and JWT tokens
5. User is logged in

### Password-Based Login Flow (Existing)
1. User enters mobile and password
2. Frontend calls `POST /api/auth/login`
3. Backend verifies credentials
4. Backend returns user data and JWT tokens
5. User is logged in

---

## Key Differences: OTP vs Password Auth

| Feature | OTP-Based | Password-Based |
|---------|-----------|----------------|
| **Signup** | Mobile + Full Name + OTP | Mobile + Full Name + Password |
| **Login** | Mobile + OTP | Mobile + Password |
| **Password** | Auto-generated (10 chars) | User-provided |
| **Phone Verification** | Automatic on OTP verify | Manual (separate flow) |
| **Endpoints** | `/api/auth/otp/send` + `/api/auth/otp/verify` | `/api/auth/signup` or `/api/auth/login` |
| **Steps** | 2-step (send OTP, verify OTP) | 1-step (direct auth) |
| **Response Field** | `authMethod: "otp"` | No authMethod field |

---

## Security Features

### 1. **Rate Limiting**

**IP-Based Rate Limiting:**
- Maximum 5 OTP requests per IP address per hour
- Prevents automated attacks and abuse
- Tracked via `ip_address` field

**Resend Limiting:**
- Maximum 3 OTP resends per mobile number per session
- Prevents SMS spam and cost abuse
- Tracked via `resend_count` field

**Verification Attempts:**
- Maximum 5 verification attempts per OTP
- Prevents brute force attacks
- Tracked via `attempts` field

### 2. **OTP Expiration**
- OTPs expire after 10 minutes
- Old OTPs are automatically invalidated when new OTP is requested
- Expired OTPs cannot be verified

### 3. **Security Logging**
- IP address tracking for all OTP requests
- User agent logging for device fingerprinting
- Audit trail with timestamps (created_at, verified_at)
- Helps detect suspicious patterns and fraud

### 4. **Multi-Channel Support**
- Channel field supports: `sms`, `email`, `whatsapp`
- Future-proof for multiple OTP delivery methods
- Currently defaults to `sms`

### 5. **Auto-Generated Passwords**
- 10-character random passwords for OTP signups
- Stored as bcrypt hash (salt rounds: 10)
- Users can reset password later if needed

### 6. **Phone Verification**
- Phone is marked as verified on successful OTP verification
- `isPhoneVerified` set to `true`
- `phoneVerifiedAt` timestamp recorded

### 7. **SMS Delivery and Fallback**
- **All environments**: Random 6-digit OTP generation (no hardcoded values)
- **SMS delivery**: Attempts SMS via Dovesoft API in all environments
- **Development fallback**: Console logging if SMS fails (for testing)
- **Production**: SMS failure returns error to user
- OTP is never exposed in API responses for security
- SMS delivery configured via environment variables

---

## Database Schema

### otp_verifications Table

```sql
CREATE TABLE otp_verifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mobile VARCHAR(15) NOT NULL,
  country_code VARCHAR(5) DEFAULT '+91',
  otp VARCHAR(6) NOT NULL,
  purpose ENUM('signup', 'login', 'verification') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_otp_mobile_purpose_verified (mobile, purpose, is_verified),
  INDEX idx_otp_expires_at (expires_at)
);
```

---

## Testing Guide

### Test OTP Signup

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "type": "signup"
  }'

# Step 2: Verify OTP (check SMS or console logs for OTP)
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "otp": "847392",
    "type": "signup",
    "fullName": "John Doe"
  }'
```

### Test OTP Login

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "type": "login"
  }'

# Step 2: Verify OTP (check SMS or console logs for OTP)
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "otp": "847392",
    "type": "login"
  }'
```

### Test Mobile Verification Only

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "type": "verification"
  }'

# Step 2: Verify OTP (check SMS or console logs for OTP)
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "otp": "847392",
    "type": "verification"
  }'
```

### Test Email Verification Only

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "type": "verification",
    "channel": "email"
  }'

# Step 2: Verify OTP (check console logs for OTP)
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "847392",
    "type": "verification"
  }'
```

**Note:** The system always generates random 6-digit OTPs. Check SMS for the OTP, or if SMS fails in development, check server console logs for fallback OTP display.

---

## Migration Instructions

Run the migration to create the `otp_verifications` table:

```bash
npx sequelize-cli db:migrate
```

To rollback:

```bash
npx sequelize-cli db:migrate:undo
```

---

## SMS Configuration

The system uses Dovesoft SMS API for sending OTPs in production. Configure the following environment variables:

```env
# SMS Configuration (Dovesoft API)
SMS_API_KEY=your-api-key-here
SMS_SENDER_ID=your-sender-id
```

**SMS Message Format:**
```
Dear Customer,
Your verification code for {OTP}

Regards,
way2share
```

**Note:** The system sends SMS with direct OTP insertion (no template variables) for reliable delivery via Dovesoft API.

**Environment Behavior:**
- **All environments**: Always generates random 6-digit OTP
- **SMS sending**: Attempts SMS via Dovesoft API in all environments
- **Development fallback**: If SMS fails in development, OTP is logged to console
- **Production**: SMS failure throws error (no console fallback)

---

## Future Enhancements

1. **Rate Limiting**
   - Limit OTP requests per mobile (e.g., 3 per hour)
   - Add cooldown period between requests

3. **OTP Cleanup Job**
   - Cron job to delete expired OTPs (older than 24 hours)
   - Keep database clean

4. **Email OTP**
   - Support OTP via email as alternative
   - Add `channel` field (sms/email)

5. **Resend OTP**
   - Add endpoint to resend OTP
   - Track resend attempts
