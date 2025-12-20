# Google OAuth Authentication API

## Overview

Google OAuth integration allows users to sign up and log in using their Google accounts. The system automatically creates user accounts and handles profile linking.

## Authentication Flow

### 1. Initiate Google OAuth

**Endpoint:** `GET /api/auth/google`

**Description:** Redirects user to Google OAuth consent screen.

**Query Parameters:**
- `device_name` (optional): Device identifier for session tracking

**Example:**
```
GET /api/auth/google?device_name=iPhone%2014
```

**Response:** Redirects to Google OAuth consent screen

---

### 2. Google OAuth Callback

**Endpoint:** `GET /api/auth/google/callback`

**Description:** Handles Google OAuth callback and processes authentication.

**Automatic Processing:**
- Creates new user if Google account not found
- Links Google account to existing user if email matches
- Generates JWT tokens
- Assigns free subscription to new users
- Redirects to frontend with authentication data

**Success Redirect:**
```
{frontend_url}/auth/callback?data={encoded_response}
```

**Error Redirect:**
```
{frontend_url}/auth/error?message={error_message}
```

**Encoded Response Data:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": null,
      "countryCode": "+91",
      "email": "john@gmail.com",
      "role": "user",
      "profile_image": "https://lh3.googleusercontent.com/...",
      "last_login_at": "2025-01-18T10:30:00.000Z",
      "isPhoneVerified": false,
      "isEmailVerified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 604800
    },
    "authMethod": "google",
    "isNewUser": false,
    "linkedExisting": false
  }
}
```

---

### 3. Complete Profile (Mobile Number)

**Endpoint:** `POST /api/auth/google/complete-profile`

**Description:** Allows Google OAuth users to add their mobile number to complete their profile.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "mobile": "9876543210",
  "countryCode": "+91"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "mobile": "9876543210",
    "countryCode": "+91",
    "email": "john@gmail.com",
    "role": "user",
    "profile_image": "https://lh3.googleusercontent.com/...",
    "status": "active",
    "isPhoneVerified": false,
    "isEmailVerified": true,
    "subscriptionType": null,
    "subscriptionExpiresAt": null,
    "last_login_at": "2025-01-18T10:30:00.000Z",
    "createdAt": "2025-01-18T10:00:00.000Z"
  },
  "timestamp": "2025-01-18T10:35:00.000Z"
}
```

## User Account Scenarios

### Scenario 1: New Google User
- User signs in with Google for the first time
- System creates new user account
- Email is automatically verified
- Mobile number is null (can be added later)
- Free subscription is automatically assigned
- `isNewUser: true` in response

### Scenario 2: Existing User (Email Match)
- User has existing account with same email
- Google account is linked to existing user
- User can now sign in with either password or Google
- `linkedExisting: true` in response

### Scenario 3: Returning Google User
- User has previously signed in with Google
- System authenticates using existing Google account link
- Updates Google tokens and profile picture
- `isNewUser: false, linkedExisting: false` in response

## Frontend Integration

### 1. Initiate Google Sign-In

```javascript
// Redirect to Google OAuth
window.location.href = '/api/auth/google?device_name=' + encodeURIComponent(deviceName);
```

### 2. Handle OAuth Callback

```javascript
// In your callback route component
const urlParams = new URLSearchParams(window.location.search);
const encodedData = urlParams.get('data');

if (encodedData) {
  const response = JSON.parse(decodeURIComponent(encodedData));
  
  if (response.success) {
    // Store tokens
    localStorage.setItem('access_token', response.data.tokens.access_token);
    localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
    
    // Check if mobile number is required
    if (!response.data.user.mobile) {
      // Redirect to mobile number collection page
      router.push('/complete-profile');
    } else {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }
}
```

### 3. Complete Profile

```javascript
const completeProfile = async (mobile, countryCode = '+91') => {
  try {
    const response = await fetch('/api/auth/google/complete-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ mobile, countryCode })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Profile completed, redirect to dashboard
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Profile completion failed:', error);
  }
};
```

## Error Handling

### Common Error Scenarios

1. **Authentication Failed**
   - Redirect: `/auth/error?message=Authentication failed`
   - User cancelled OAuth or Google returned error

2. **Authentication Cancelled**
   - Redirect: `/auth/error?message=Authentication cancelled`
   - User closed OAuth popup or denied permissions

3. **Processing Failed**
   - Redirect: `/auth/error?message=Authentication processing failed`
   - Server error during user creation or token generation

4. **Mobile Already Registered**
   - Status: 400
   - Message: "Mobile number already registered with another account"

5. **Invalid Mobile Format**
   - Status: 400
   - Message: "Valid 10-digit mobile number is required"

## Security Features

1. **JWT Token Security**
   - Access tokens expire in 7 days
   - Refresh tokens expire in 30 days
   - Tokens include user role and permissions

2. **Session Management**
   - Device tracking for security
   - IP address logging
   - Session invalidation on logout

3. **Account Linking**
   - Prevents duplicate accounts with same email
   - Secure linking of Google accounts to existing users

4. **Profile Picture Handling**
   - Google profile pictures are stored as external URLs
   - No local storage required
   - Automatic updates on each login

## Configuration

### Environment Variables

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL for redirects
CORS_ORIGIN=http://localhost:3000
```

### Google Cloud Console Setup

1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

## Database Schema

### UserSocialAccount Table

```sql
CREATE TABLE user_social_accounts (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_id VARCHAR(200) NOT NULL,
  email VARCHAR(150),
  profile_picture_url TEXT,
  profile_picture_storage_type ENUM('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean'),
  profile_picture_mime_type VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Users Table Updates

- `mobile` field is now nullable
- `email` can be populated from Google OAuth
- `isEmailVerified` set to true for Google users
- `passwordHash` contains random password for Google users

## Testing

### Manual Testing Steps

1. **New User Flow**
   - Visit `/api/auth/google`
   - Complete Google OAuth
   - Verify user creation
   - Check free subscription assignment
   - Test mobile number addition

2. **Existing User Flow**
   - Create user with email
   - Sign in with Google using same email
   - Verify account linking
   - Test subsequent Google logins

3. **Error Scenarios**
   - Cancel OAuth flow
   - Use invalid mobile number
   - Try duplicate mobile number

### API Testing

```bash
# Test Google OAuth initiation
curl -X GET "http://localhost:5000/api/auth/google?device_name=TestDevice"

# Test profile completion
curl -X POST "http://localhost:5000/api/auth/google/complete-profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "countryCode": "+91"}'
```