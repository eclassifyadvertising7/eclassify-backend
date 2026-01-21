# Authentication API Documentation

Base URL: `/api/auth`

## Overview

The authentication system supports multiple authentication methods:
- **Password-based authentication** (signup/login with password)
- **OTP-based authentication** (signup/login with OTP verification)
- **Google OAuth** (sign in with Google account)
- **Password reset** (forgot password with OTP)

## Table of Contents
- [Password-Based Authentication](#password-based-authentication)
  - [Signup](#signup)
  - [Login](#login)
- [OTP-Based Authentication](#otp-based-authentication)
- [Google OAuth Authentication](#google-oauth-authentication)
- [Password Reset](#password-reset)
- [Common Endpoints](#common-endpoints)
  - [Get Profile](#get-profile)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
- [JWT Token Structure](#jwt-token-structure)
- [Status Codes](#status-codes)
- [Notes](#notes)

---

## Password-Based Authentication

## Signup

Register a new user account.

**Endpoint:** `POST /api/auth/signup`

**Access:** Public

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "fullName": "string (required, min 2 characters)",
  "mobile": "string (required, 10 digits)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)",
  "countryCode": "string (optional, default: +91)",
  "referralCode": "string (optional)",
  "device_name": "string (optional)"
}
```

### Field Descriptions
- `fullName`: User's full name (minimum 2 characters)
- `mobile`: 10-digit mobile number without country code
- `email`: Valid email address
- `password`: User password (minimum 6 characters)
- `countryCode`: Country dialing code (defaults to +91 for India)
- `referralCode`: Referral code from another user (optional)
- `device_name`: Device identifier for session tracking (optional)

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "countryCode": "+91",
      "email": "john@example.com",
      "role": "user",
      "profile_image": null,
      "last_login_at": null,
      "isPhoneVerified": false,
      "isEmailVerified": false,
      "is_password_reset": false
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer"
    },
    "counts": {
      "unreadNotifications": 0,
      "unreadChats": 0
    }
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request** - Validation errors
```json
{
  "success": false,
  "message": "Full name must be at least 2 characters",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**400 Bad Request** - Mobile already registered
```json
{
  "success": false,
  "message": "Mobile number already registered",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**400 Bad Request** - Invalid referral code
```json
{
  "success": false,
  "message": "Invalid referral code",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**400 Bad Request** - Cannot use own referral code
```json
{
  "success": false,
  "message": "Cannot use your own referral code",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobile": "9876543210",
    "email": "john@example.com",
    "password": "securepass123",
    "referralCode": "REFABC12",
    "device_name": "iPhone 13"
  }'
```

---

## Login

Authenticate user with email or mobile number and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "username": "string (required, email or 10-digit mobile)",
  "password": "string (required)",
  "device_name": "string (optional)"
}
```

### Field Descriptions
- `username`: Email address or 10-digit mobile number used during registration
- `password`: User password
- `device_name`: Device identifier for session tracking (optional)

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "countryCode": "+91",
      "email": "john@example.com",
      "role": "user",
      "profile_image": null,
      "last_login_at": "2025-11-23T10:30:00.000Z",
      "isPhoneVerified": false,
      "isEmailVerified": false,
      "is_password_reset": false
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer"
    },
    "counts": {
      "unreadNotifications": 5,
      "unreadChats": 3
    }
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**401 Unauthorized** - Account suspended
```json
{
  "success": false,
  "message": "Account has been suspended",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**400 Bad Request** - Missing fields
```json
{
  "success": false,
  "message": "Missing required fields",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**400 Bad Request** - Invalid format
```json
{
  "success": false,
  "message": "Invalid email or mobile number format",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Example Request (Mobile)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "9876543210",
    "password": "securepass123"
  }'
```

### Example Request (Email)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "securepass123"
  }'
```

---

## OTP-Based Authentication

For OTP-based authentication (passwordless signup and login), see the dedicated documentation:

**[OTP Authentication API Documentation](./otp-authentication.md)**

Key endpoints:
- `POST /api/auth/otp/send` - Send OTP to mobile/email
- `POST /api/auth/otp/verify` - Verify OTP code
- `POST /api/auth/otp/signup` - Complete signup after OTP verification
- `POST /api/auth/otp/login` - Complete login after OTP verification

---

## Google OAuth Authentication

For Google OAuth authentication (sign in with Google), see the dedicated documentation:

**[Google OAuth API Documentation](./google-oauth.md)**

Key endpoints:
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/google/complete-profile` - Add mobile number to Google account

---

## Password Reset

For password reset functionality, see the dedicated documentation:

**[Password Reset API Documentation](./password-reset.md)**

Key endpoints:
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password using OTP

---

## Common Endpoints

### Get Profile

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Access:** Private (requires authentication)

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
None

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "mobile": "9876543210",
    "countryCode": "+91",
    "email": null,
    "role": "user",
    "profile_image": null,
    "status": "active",
    "isPhoneVerified": false,
    "isEmailVerified": false,
    "is_password_reset": false,
    "last_login_at": "2025-11-23T10:30:00.000Z",
    "createdAt": "2025-11-20T08:15:00.000Z"
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized access",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**401 Unauthorized** - Token expired
```json
{
  "success": false,
  "message": "Access token expired",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Example Request
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh-token`

**Access:** Public

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "refresh_token": "string (required)"
}
```

### Field Descriptions
- `refresh_token`: Valid refresh token received during login/signup

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer"
    }
  },
  "timestamp": "2025-11-23T10:35:00.000Z"
}
```

### Error Responses

**401 Unauthorized** - Invalid refresh token
```json
{
  "success": false,
  "message": "Invalid refresh token",
  "data": null,
  "timestamp": "2025-11-23T10:35:00.000Z"
}
```

**401 Unauthorized** - Refresh token expired
```json
{
  "success": false,
  "message": "Refresh token expired",
  "data": null,
  "timestamp": "2025-11-23T10:35:00.000Z"
}
```

**400 Bad Request** - Missing refresh token
```json
{
  "success": false,
  "message": "Missing required fields",
  "data": null,
  "timestamp": "2025-11-23T10:35:00.000Z"
}
```

### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Logout

Logout user and invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Access:** Public

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "refresh_token": "string (required)"
}
```

### Field Descriptions
- `refresh_token`: Valid refresh token to invalidate

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "timestamp": "2025-11-23T10:40:00.000Z"
}
```

### Error Responses

**400 Bad Request** - Missing refresh token
```json
{
  "success": false,
  "message": "Missing required fields",
  "data": null,
  "timestamp": "2025-11-23T10:40:00.000Z"
}
```

### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## JWT Token Structure

### Access Token Payload
```json
{
  "userId": 1,
  "roleId": 3,
  "roleSlug": "user",
  "mobile": "9876543210",
  "email": null,
  "iat": 1700000000,
  "exp": 1700001800
}
```

### Refresh Token Payload
```json
{
  "userId": 1,
  "iat": 1700000000,
  "exp": 1700604800
}
```

### Token Fields
- `userId`: User's unique identifier (BIGINT)
- `roleId`: User's role ID (INTEGER) - access token only
- `roleSlug`: Role slug for quick permission checks - access token only
- `mobile`: User's mobile number - access token only
- `email`: User's email (if provided) - access token only
- `iat`: Token issued at timestamp
- `exp`: Token expiration timestamp

### Token Expiry
- **Access Token**: 7 days (configurable via `ACCESS_TOKEN_EXPIRY` env variable)
- **Refresh Token**: 30 days (configurable via `REFRESH_TOKEN_EXPIRY` env variable)

### Token Usage
Include the access token in the `Authorization` header for protected routes:
```
Authorization: Bearer <your_access_token>
```

### Token Refresh Flow
1. Client receives both tokens on login/signup
2. Client uses access token for API requests
3. When access token expires, use refresh token to get new tokens
4. Old refresh token is invalidated, new tokens are issued
5. Repeat until refresh token expires (requires re-login)

### Session Management
- Each login/signup creates a new session record with device information
- Sessions track: device name, user agent, IP address
- Refresh token rotation invalidates old tokens
- All sessions can be invalidated (e.g., on password reset)

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Notes

### Authentication Methods

1. **Multiple Authentication Options**:
   - Password-based: Traditional email/mobile + password
   - OTP-based: Passwordless authentication with OTP verification
   - Google OAuth: Sign in with Google account
   - All methods generate the same JWT token structure

2. **Account Linking**:
   - Google OAuth automatically links to existing accounts with matching email
   - Users can have both password and Google OAuth enabled
   - Mobile number can be added to Google accounts later

### User Registration

3. **Default Role**: New users are automatically assigned the "user" role during signup.

4. **Free Subscription**: All new users automatically receive free subscription plans upon registration.

5. **Referral System**: 
   - Each user gets a unique referral code (e.g., `REFABC12`)
   - Users can sign up with a referral code
   - Referrer's count is incremented when someone uses their code
   - Cannot use your own referral code

6. **Welcome Notification**: New users receive an automated welcome notification.

### Mobile and Email

7. **Mobile Number Format**: Always provide 10-digit mobile numbers without country code. Country code is stored separately (defaults to +91).

8. **Email Required**: Both mobile and email are required fields for all signup methods (password-based and OTP-based).

9. **Verification Flags**:
   - `isPhoneVerified`: Set to true after OTP verification or Google OAuth
   - `isEmailVerified`: Set to true after OTP verification or Google OAuth
   - `is_password_reset`: Set to true after password reset

### Security

10. **Password Requirements**: Minimum 6 characters (can be enhanced with complexity rules).

11. **Account Status**: Users with status `blocked`, `suspended`, or inactive accounts cannot login or refresh tokens.

12. **Session Management**: 
    - Each login/signup creates a new session record with device information
    - Sessions track: device name, user agent, IP address
    - Refresh token rotation invalidates old tokens
    - All sessions invalidated on password reset

13. **Token Storage**: Store refresh tokens securely (httpOnly cookies recommended). Access tokens can be stored in memory.

### API Response

14. **Response Format**: All responses include a `timestamp` field with ISO 8601 format.

15. **Unread Counts**: Login and signup responses include real-time unread counts:
    - `unreadNotifications`: Total unread notifications for the user
    - `unreadChats`: Total unread chat messages across all chat rooms
    - New users will have both counts as 0
    - For real-time updates after login, use Socket.io

16. **Device Information**: Optional `device_name` parameter can be included in request body for session tracking.

### Password Reset

17. **Password Reset Flow**:
    - Request OTP via email/SMS using forgot-password endpoint
    - OTP expires in 10 minutes
    - Reset password using OTP and new password
    - All active sessions are invalidated after successful reset
    - See [Password Reset API Documentation](./password-reset.md) for details
