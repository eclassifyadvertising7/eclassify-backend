# Authentication API Testing Guide

Quick guide to test the authentication endpoints.

## Prerequisites

1. Database is running and migrations are applied
2. Server is running on `http://localhost:5000`
3. Default "user" role exists in the database

## Test Sequence

### 1. Test Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "9876543210",
    "password": "test123"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "fullName": "Test User",
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
    }
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

Save both tokens for next steps.

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "test123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user data */ },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer"
    }
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### 3. Test Get Profile

Replace `YOUR_ACCESS_TOKEN` with the access token from signup/login:

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 1,
    "fullName": "Test User",
    "mobile": "9876543210",
    "role": "user",
    "profile_image": null,
    /* ... more user data */
  },
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### 4. Test Refresh Token

Replace `YOUR_REFRESH_TOKEN` with the refresh token from signup/login:

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
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

### 5. Test Logout

Replace `YOUR_REFRESH_TOKEN` with the refresh token:

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "timestamp": "2025-11-23T10:40:00.000Z"
}
```

## Error Cases to Test

### Duplicate Mobile Number
```bash
# Try to signup with same mobile again
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Another User",
    "mobile": "9876543210",
    "password": "test123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Mobile number already registered",
  "data": null
}
```

### Invalid Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "wrongpassword"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Missing Token
```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized access",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid access token",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

## Using Postman

1. Import the endpoints into Postman
2. Create environment variables: `access_token` and `refresh_token`
3. After signup/login, save the tokens:
   ```javascript
   pm.environment.set("access_token", pm.response.json().data.tokens.access_token);
   pm.environment.set("refresh_token", pm.response.json().data.tokens.refresh_token);
   ```
4. Use `{{access_token}}` in Authorization header for protected routes
5. Use `{{refresh_token}}` in request body for refresh/logout endpoints

## Validation Tests

### Invalid Mobile Format
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "123",
    "password": "test123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid phone number format",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Short Password
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "9876543210",
    "password": "123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```

### Short Name
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "A",
    "mobile": "9876543210",
    "password": "test123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Full name must be at least 2 characters",
  "data": null,
  "timestamp": "2025-11-23T10:30:00.000Z"
}
```
