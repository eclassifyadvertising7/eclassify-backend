# OTP-Based Authentication API Documentation

## Overview

OTP-based authentication allows users to sign up and log in using their mobile number without requiring a password. The system uses a hardcoded OTP (1234) for development purposes (no DLT registration required).

**Key Features:**
- Passwordless authentication via OTP
- Auto-generated password for OTP-based signups (stored securely)
- Phone number verification on successful OTP verification
- 10-minute OTP expiration
- Maximum 5 verification attempts per OTP
- Supports both signup and login flows

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

**Request Body:**
```json
{
  "mobile": "9175113022",
  "countryCode": "+91",
  "type": "signup",
  "channel": "sms"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mobile | string | Yes | 10-digit mobile number (without country code) |
| countryCode | string | No | Country code (default: +91) |
| type | string | Yes | Type of OTP: `signup`, `login`, or `verification` |
| channel | string | No | Delivery channel: `sms`, `email`, or `whatsapp` (default: sms) |

**Validation Rules:**
- `mobile`: Must be exactly 10 digits
- `type`: Must be one of: `signup`, `login`, `verification`
- `channel`: Must be one of: `sms`, `email`, `whatsapp`
- For `signup`: Mobile number must NOT exist in database
- For `login`: Mobile number must exist in database

**Rate Limiting:**
- Maximum 5 OTP requests per IP address per hour
- Maximum 3 resends per mobile number per session (10 minutes)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobile": "9175113022",
    "countryCode": "+91",
    "type": "signup",
    "channel": "sms",
    "expiresIn": 600,
    "resendCount": 0,
    "otp": "1234"
  },
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

**Response Fields:**
- `expiresIn`: OTP validity in seconds (600 = 10 minutes)
- `resendCount`: Number of times OTP has been resent (0 for first send, max 3)
- `otp`: Only included in development mode (`NODE_ENV=development`)

**Note:** The `otp` field is only included in development mode. Remove this in production.

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

### 2. Verify OTP (Signup)

Verify OTP and complete user registration.

**Endpoint:** `POST /api/auth/otp/verify`

**Access:** Public

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body (Signup):**
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

**Request Parameters (Signup):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mobile | string | Yes | 10-digit mobile number |
| otp | string | Yes | OTP code received (1234 for development) |
| type | string | Yes | Must be `signup` |
| fullName | string | Yes | User's full name (min 2 characters) |
| countryCode | string | No | Country code (default: +91) |
| device_name | string | No | Device name for session tracking |

**Success Response (201 Created):**
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

**Important Notes:**
- Password is auto-generated (10 characters) and stored securely
- User doesn't need to provide a password during OTP signup
- Phone is automatically verified (`isPhoneVerified: true`)
- User receives JWT tokens immediately after signup

---

### 3. Verify OTP (Login)

Verify OTP and log in existing user.

**Endpoint:** `POST /api/auth/otp/verify`

**Access:** Public

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body (Login):**
```json
{
  "mobile": "9175113022",
  "otp": "1234",
  "type": "login",
  "device_name": "iPhone 14 Pro"
}
```

**Request Parameters (Login):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mobile | string | Yes | 10-digit mobile number |
| otp | string | Yes | OTP code received (1234 for development) |
| type | string | Yes | Must be `login` |
| device_name | string | No | Device name for session tracking |

**Note:** `fullName` is NOT required for login (only for signup).

**Success Response (200 OK):**
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

---

### Common Error Responses (Verify OTP)

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
        // In development, you can auto-fill: setOtp(data.data.otp);
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
5. Frontend calls `POST /api/auth/otp/verify` with mobile, OTP, purpose, and fullName
6. Backend creates user with auto-generated password
7. Backend returns user data and JWT tokens
8. User is logged in

### OTP-Based Login Flow
1. User enters mobile number
2. Frontend calls `POST /api/auth/otp/send` with `type: "login"`
3. Backend sends OTP (hardcoded 1234)
4. User enters OTP
5. Frontend calls `POST /api/auth/otp/verify` with mobile, OTP, and purpose
6. Backend verifies user and OTP
7. Backend returns user data and JWT tokens
8. User is logged in

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

### 7. **Development Mode**
- Hardcoded OTP `1234` for development (no DLT required)
- OTP included in response when `NODE_ENV=development`
- Remove OTP from response in production

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

# Step 2: Verify OTP
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "otp": "1234",
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

# Step 2: Verify OTP
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9175113022",
    "otp": "1234",
    "type": "login"
  }'
```

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

## Future Enhancements

1. **SMS Integration**
   - Integrate with SMS gateway (Twilio, AWS SNS, etc.)
   - Remove hardcoded OTP
   - Add DLT registration

2. **Rate Limiting**
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
