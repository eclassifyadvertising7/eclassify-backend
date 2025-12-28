# Referral System API

## Overview

The referral system allows users to invite others using unique referral codes. Each user gets a unique code upon signup that they can share. When someone signs up using a referral code, the referrer's count is incremented.

**Phase 1 Implementation:** Basic tracking only - no rewards yet. Rewards will be implemented in Phase 2.

---

## Public Endpoints

### Validate Referral Code

Validates if a referral code exists and returns the referrer's name.

**Endpoint:** `GET /api/public/referrals/validate/:code`

**Authentication:** None required

**Parameters:**
- `code` (path parameter) - The referral code to validate

**Response Success (200):**
```json
{
  "success": true,
  "message": "Valid referral code",
  "data": {
    "valid": true,
    "referrerName": "John Doe"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Invalid referral code",
  "data": null
}
```

---

## Authentication Endpoints

### Signup with Referral Code

Users can provide an optional referral code during signup.

**Endpoint:** `POST /api/auth/otp/complete-signup`

**Authentication:** None required (but OTP must be verified first)

**Request Body:**
```json
{
  "mobile": "9175113022",
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123",
  "countryCode": "+91",
  "referralCode": "REFABC12"
}
```

**Fields:**
- `mobile` (required) - 10-digit mobile number
- `email` (required) - Valid email address
- `fullName` (required) - User's full name (min 2 characters)
- `password` (required) - Password (min 6 characters)
- `countryCode` (optional) - Default: "+91"
- `referralCode` (optional) - Referral code from another user

**Response Success (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9175113022",
      "email": "user@example.com",
      "referralCode": "REFXYZ78",
      "referralCount": 0
    },
    "tokens": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid referral code",
  "data": null
}
```

**Validation Rules:**
- Referral code must exist in the system
- Cannot use your own referral code
- Mobile/email must not be already registered

---

## End-User Endpoints (Authenticated)

### Get My Referral Code

Retrieve your own referral code and share URL.

**Endpoint:** `GET /api/end-user/referrals/my-code`

**Authentication:** Required (Bearer token)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Referral code retrieved successfully",
  "data": {
    "referralCode": "REFABC12",
    "referralCount": 5,
    "shareUrl": "http://localhost:3000/signup?ref=REFABC12",
    "shareMessage": "Join me on EClassify using my referral code: REFABC12"
  }
}
```

**Usage:**
- Display referral code in user profile
- Use `shareUrl` for direct sharing links
- Use `shareMessage` for WhatsApp/SMS sharing

---

### Get My Referrals

Get list of users who signed up using your referral code.

**Endpoint:** `GET /api/end-user/referrals/my-referrals`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Referrals retrieved successfully",
  "data": [
    {
      "id": 456,
      "fullName": "Jane Smith",
      "mobile": "9876543210",
      "createdAt": "2024-12-27T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Database Schema

### Users Table (Updated)

New columns added:
- `referral_code` (VARCHAR(20), UNIQUE) - User's unique referral code
- `referred_by` (BIGINT, FK to users.id) - ID of user who referred this user
- `referral_count` (INT, DEFAULT 0) - Count of successful referrals

---

## Implementation Notes

### Referral Code Generation

- Format: `REF` + 5 random alphanumeric characters (e.g., `REFABC12`)
- Guaranteed unique across all users
- Generated automatically during signup
- Cannot be changed by user

### Referral Tracking

- When user signs up with referral code:
  1. Validate referral code exists
  2. Ensure user isn't using their own code
  3. Set `referred_by` to referrer's ID
  4. Increment referrer's `referral_count`
  5. Generate new referral code for new user

### Phase 2 Features (Not Yet Implemented)

Future enhancements will include:
- Reward points/credits for successful referrals
- Milestone rewards (e.g., 5 referrals = bonus)
- Referral leaderboard
- Referral analytics dashboard
- Custom referral campaigns

---

## Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid referral code | Referral code doesn't exist |
| 400 | Cannot use your own referral code | User tried to refer themselves |
| 404 | User not found | Invalid user ID |
| 500 | Internal server error | Server-side error |

---

## Frontend Integration

### Signup Flow with Referral

1. User receives share link: `https://yourapp.com/signup?ref=REFABC12`
2. Frontend extracts `ref` parameter from URL
3. Call `GET /api/public/referrals/validate/REFABC12` to validate
4. Display referrer's name: "Join via John Doe's invitation"
5. User completes OTP verification
6. Include `referralCode` in signup request

### Profile Display

1. Call `GET /api/end-user/referrals/my-code` on profile load
2. Display referral code prominently
3. Show referral count
4. Provide share buttons (WhatsApp, SMS, Copy link)

### Referrals List

1. Call `GET /api/end-user/referrals/my-referrals?page=1&limit=20`
2. Display list of referred users
3. Show join date for each referral
4. Implement pagination for large lists
