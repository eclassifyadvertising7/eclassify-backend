# OTP Authentication API

## 1. Send OTP

**Method:** POST  
**Endpoint:** `/api/auth/otp/send`

**Request Payload:**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "countryCode": "+91",
  "type": "signup",
  "fullName": "John Doe"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "type": "signup",
    "channel": "email",
    "mobile": "9175113022",
    "countryCode": "+91",
    "email": "user@example.com",
    "expiresIn": 600
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response Payload:**
```json
{
  "success": false,
  "message": "Invalid OTP type. Must be signup, login, or verification",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Verify OTP

**Method:** POST  
**Endpoint:** `/api/auth/otp/verify`

**Request Payload:**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "otp": "123456",
  "type": "signup"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Mobile number verified successfully",
  "data": {
    "mobile": "9175113022",
    "email": "user@example.com",
    "type": "signup",
    "verified": true
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Error Response Payload:**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "data": null,
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## 3. Complete Signup

**Method:** POST  
**Endpoint:** `/api/auth/otp/complete-signup`

**Request Payload:**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123",
  "countryCode": "+91",
  "referralCode": "REFABC12",
  "device_name": "iPhone 13"
}
```

**Fields:**
- `mobile` (required) - 10-digit mobile number (must be OTP verified)
- `email` (required) - Valid email address (must be OTP verified)
- `fullName` (required) - User's full name (min 2 characters)
- `password` (required) - Password (min 6 characters)
- `countryCode` (optional) - Default: "+91"
- `referralCode` (optional) - Referral code from another user
- `device_name` (optional) - Device identifier

**Response Payload:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 123,
      "mobile": "9175113022",
      "email": "user@example.com",
      "fullName": "John Doe",
      "referralCode": "REFXYZ78",
      "referralCount": 0,
      "roleId": 1,
      "roleSlug": "user",
      "isActive": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

**Error Response Payload:**
```json
{
  "success": false,
  "message": "Invalid referral code",
  "data": null,
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

**Validation Rules:**
- Either mobile or email must be verified via OTP before signup
- Referral code must exist in the system (if provided)
- Cannot use your own referral code
- Mobile/email must not be already registered

**Notes:**
- New user automatically gets a unique referral code (e.g., `REFXYZ78`)
- If valid referral code provided, referrer's count is incremented
- Free subscription plan is automatically assigned

---

## 4. Complete Login

**Method:** POST  
**Endpoint:** `/api/auth/otp/login`

**Request Payload:**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "device_name": "iPhone 13"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 123,
      "mobile": "9175113022",
      "email": "user@example.com",
      "fullName": "John Doe",
      "roleId": 1,
      "roleSlug": "user",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

**Error Response Payload:**
```json
{
  "success": false,
  "message": "Mobile number not verified. Please verify OTP first",
  "data": null,
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```
