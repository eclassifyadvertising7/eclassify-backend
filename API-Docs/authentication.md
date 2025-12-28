# Authentication API Documentation

Base URL: `/api/auth`

## Table of Contents
- [Signup](#signup)
- [Login](#login)
- [Get Profile](#get-profile)
- [Refresh Token](#refresh-token)
- [Logout](#logout)

---

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
  "password": "string (required, min 6 characters)",
  "countryCode": "string (optional, default: +91)"
}
```

### Field Descriptions
- `fullName`: User's full name (minimum 2 characters)
- `mobile`: 10-digit mobile number without country code
- `password`: User password (minimum 6 characters)
- `countryCode`: Country dialing code (defaults to +91 for India)

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
      "email": null,
      "role": "user",
      "profile_image": null,
      "last_login_at": null,
      "isPhoneVerified": false,
      "isEmailVerified": false
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

### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobile": "9876543210",
    "password": "securepass123"
  }'
```

---

## Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "mobile": "string (required, 10 digits)",
  "password": "string (required)"
}
```

### Field Descriptions
- `mobile`: 10-digit mobile number used during registration
- `password`: User password

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
      "email": null,
      "role": "user",
      "profile_image": null,
      "last_login_at": "2025-11-23T10:30:00.000Z",
      "isPhoneVerified": false,
      "isEmailVerified": false
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

### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "securepass123"
  }'
```

---

## Get Profile

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
    "subscriptionType": "free",
    "subscriptionExpiresAt": null,
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

### Token Types
- **Access Token**: Short-lived (default: 7 days), used for API authentication
- **Refresh Token**: Long-lived (default: 30 days), used to get new access tokens

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

1. **Mobile Number Format**: Always provide 10-digit mobile numbers without country code. Country code is stored separately (defaults to +91).

2. **Password Requirements**: Minimum 6 characters (can be enhanced with complexity rules).

3. **Token Expiry**: 
   - Access tokens expire in 7 days (configurable via `ACCESS_TOKEN_EXPIRY`)
   - Refresh tokens expire in 30 days (configurable via `REFRESH_TOKEN_EXPIRY`)

4. **Account Status**: Users with status `blocked`, `suspended`, or inactive accounts cannot login or refresh tokens.

5. **Default Role**: New users are automatically assigned the "user" role during signup.

6. **Phone Verification**: Currently, phone verification is not enforced but the flag is tracked for future implementation.

7. **Session Management**: Each login/signup creates a new session record. Refresh token rotation invalidates old tokens.

8. **Response Format**: All responses include a `timestamp` field with ISO 8601 format.

9. **Token Storage**: Store refresh tokens securely (httpOnly cookies recommended). Access tokens can be stored in memory.

10. **Unread Counts**: Login and signup responses include real-time unread counts for notifications and chat messages. These counts are calculated at the time of authentication:
    - `unreadNotifications`: Total unread notifications for the user
    - `unreadChats`: Total unread chat messages across all chat rooms
    - New users will have both counts as 0
    - For real-time updates after login, use Socket.io (see `SOCKET-UNREAD-COUNTS-PLAN.md`)
