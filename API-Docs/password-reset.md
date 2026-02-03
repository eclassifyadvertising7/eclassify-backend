# Password Reset & Change API Documentation

This document covers two separate password operations:
1. **Password Reset** - For users who forgot their password (requires OTP)
2. **Password Change** - For authenticated users who want to change their password (no OTP required)

---

## Password Reset (Forgot Password Flow)

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Initiates password reset process by sending OTP to user's email or mobile

**Authentication:** None (Public)

**Request Body:**
```json
{
  "username": "user@example.com"
}
```

**Validation Rules:**
- `username` is required
- Must be either valid email or 10-digit mobile number

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset OTP has been sent to your email",
  "data": {
    "email": "user@example.com",
    "channel": "email",
    "expiresAt": "2024-01-15T10:20:00.000Z"
  },
  "timestamp": "2024-01-15T10:10:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid email/mobile format
- `400` - User not found
- `400` - Account suspended/inactive

---

### 2. Reset Password with OTP

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Resets password using OTP received via email/SMS

**Authentication:** None (Public)

**Request Body:**
```json
{
  "username": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Validation Rules:**
- All fields required
- `newPassword` must be at least 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null,
  "timestamp": "2024-01-15T10:15:00.000Z"
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Password must be at least 6 characters
- `400` - Invalid or expired OTP
- `400` - User not found

**Notes:**
- OTP expires in 10 minutes
- All user sessions are invalidated after password reset
- User must login again with new password

---

## Password Change (Authenticated Users)

### 3. Change Password

**Endpoint:** `POST /api/profile/change-password`

**Description:** Allows authenticated users to change their password without OTP

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Validation Rules:**
- Both fields required
- `newPassword` must be at least 6 characters
- `newPassword` must be different from `currentPassword`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "timestamp": "2024-01-15T10:15:00.000Z"
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - New password must be at least 6 characters
- `400` - New password must be different from current password
- `400` - Current password is incorrect
- `401` - Unauthorized (invalid/expired token)
- `404` - User not found

**Notes:**
- No OTP required (user is already authenticated)
- Current password must be provided for security
- New password must be different from current password
- User sessions remain active after password change

---

## Comparison: Reset vs Change

| Feature | Password Reset | Password Change |
|---------|---------------|-----------------|
| **Endpoint** | `/api/auth/reset-password` | `/api/profile/change-password` |
| **Authentication** | None (Public) | Required |
| **OTP Required** | Yes | No |
| **Current Password** | Not required | Required |
| **Use Case** | Forgot password | Change existing password |
| **Sessions** | All invalidated | Remain active |

---

## Example Flows

### Forgot Password Flow
```
1. User clicks "Forgot Password"
2. POST /api/auth/forgot-password { username }
3. User receives OTP via email/SMS
4. POST /api/auth/reset-password { username, otp, newPassword }
5. User logs in with new password
```

### Change Password Flow (Authenticated)
```
1. User navigates to "Change Password" in settings
2. POST /api/profile/change-password { currentPassword, newPassword }
3. Password updated, user continues session
```

---

## Security Notes

1. **Password Requirements:**
   - Minimum 6 characters
   - Consider enforcing stronger requirements in production

2. **OTP Security:**
   - OTP expires in 10 minutes
   - One-time use only
   - Invalidated after successful reset

3. **Session Management:**
   - Password reset invalidates all sessions
   - Password change keeps sessions active

4. **Rate Limiting:**
   - Consider implementing rate limiting on both endpoints
   - Prevent brute force attacks
