# Referral System Implementation Guide

## Overview

Phase 1 implementation of the referral system - basic tracking without rewards. Users can share referral codes and track who signed up using their code.

---

## Database Changes

### Run SQL Migration

Execute the SQL file to add referral fields to users table:

```bash
psql -U your_username -d your_database -f migrations/add-referral-fields-to-users.sql
```

Or run directly in your database:

```sql
ALTER TABLE users 
ADD COLUMN referral_code VARCHAR(20) UNIQUE,
ADD COLUMN referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN referral_count INT DEFAULT 0;

CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
```

### Verify Changes

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name IN ('referral_code', 'referred_by', 'referral_count');
```

---

## Files Modified

### Models
- `src/models/User.js` - Added referral fields and associations

### Services
- `src/services/authService.js` - Added referral code generation and validation logic

### Repositories
- `src/repositories/authRepository.js` - Added methods: `findByReferralCode()`, `incrementReferralCount()`

### Controllers
- `src/controllers/auth/otpController.js` - Updated to accept referralCode parameter
- `src/controllers/end-user/referralController.js` - NEW: Referral management endpoints

### Routes
- `src/routes/end-user/referralRoutes.js` - NEW: End-user referral routes
- `src/routes/public/referralRoutes.js` - NEW: Public referral validation route
- `src/routes/index.js` - Mounted new referral routes

### Documentation
- `API-Docs/referrals.md` - NEW: Complete referral API documentation
- `API-Docs/otp-authentication.md` - Updated signup endpoint with referralCode
- `DATABASE-SCHEMA.md` - Updated users table schema

---

## API Endpoints

### Public Endpoints

**Validate Referral Code**
```
GET /api/public/referrals/validate/:code
```

### End-User Endpoints (Authenticated)

**Get My Referral Code**
```
GET /api/end-user/referrals/my-code
```

**Get My Referrals List**
```
GET /api/end-user/referrals/my-referrals?page=1&limit=20
```

### Authentication Endpoint (Updated)

**Signup with Referral Code**
```
POST /api/auth/otp/complete-signup
Body: { mobile, email, fullName, password, referralCode }
```

---

## How It Works

### Signup Flow

1. User receives share link: `https://yourapp.com/signup?ref=REFABC12`
2. Frontend validates referral code: `GET /api/public/referrals/validate/REFABC12`
3. User completes OTP verification
4. User submits signup with referralCode in payload
5. Backend:
   - Validates referral code exists
   - Ensures user isn't using their own code
   - Generates unique referral code for new user
   - Sets `referred_by` to referrer's ID
   - Increments referrer's `referral_count`
6. New user receives their own referral code in response

### Referral Code Generation

- Format: `REF` + 5 random hex characters (uppercase)
- Example: `REFABC12`, `REF3F8A9`
- Guaranteed unique across all users
- Generated automatically during signup
- Cannot be changed by user

### Referral Tracking

Each user has:
- `referral_code` - Their unique code to share
- `referred_by` - ID of user who referred them (nullable)
- `referral_count` - Count of users they've referred

---

## Testing

### Test Referral Code Validation

```bash
# Valid code
curl http://localhost:5000/api/public/referrals/validate/REFABC12

# Invalid code
curl http://localhost:5000/api/public/referrals/validate/INVALID123
```

### Test Signup with Referral

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","type":"signup"}'

# 2. Verify OTP
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"123456","type":"signup"}'

# 3. Complete signup with referral code
curl -X POST http://localhost:5000/api/auth/otp/complete-signup \
  -H "Content-Type: application/json" \
  -d '{
    "mobile":"9876543210",
    "email":"test@example.com",
    "fullName":"Test User",
    "password":"password123",
    "referralCode":"REFABC12"
  }'
```

### Test Get My Referral Code

```bash
curl http://localhost:5000/api/end-user/referrals/my-code \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Get My Referrals

```bash
curl http://localhost:5000/api/end-user/referrals/my-referrals?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Frontend Integration

### Signup Page

```javascript
// Extract referral code from URL
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get('ref');

// Validate referral code
if (referralCode) {
  const response = await fetch(`/api/public/referrals/validate/${referralCode}`);
  const data = await response.json();
  
  if (data.success) {
    // Show: "Join via {referrerName}'s invitation"
    setReferrerName(data.data.referrerName);
  }
}

// Include in signup request
const signupData = {
  mobile: "9876543210",
  email: "user@example.com",
  fullName: "John Doe",
  password: "password123",
  referralCode: referralCode // Include if present
};
```

### Profile Page - Display Referral Code

```javascript
// Fetch user's referral code
const response = await fetch('/api/end-user/referrals/my-code', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const data = await response.json();

// Display:
// - Referral Code: REFABC12
// - Referrals Count: 5
// - Share URL: https://yourapp.com/signup?ref=REFABC12
// - Share buttons (WhatsApp, SMS, Copy)
```

### Referrals List Page

```javascript
// Fetch referrals with pagination
const response = await fetch('/api/end-user/referrals/my-referrals?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const data = await response.json();

// Display list of referred users:
// - Name
// - Mobile
// - Join date
```

---

## Phase 2 Features (Future)

The following features are planned for Phase 2:

1. **Reward System**
   - Points/credits for successful referrals
   - Milestone rewards (5 referrals = bonus)
   - Referral leaderboard

2. **Advanced Tracking**
   - Referral conversion analytics
   - Referral source tracking
   - Custom referral campaigns

3. **Admin Features**
   - Referral analytics dashboard
   - Manual reward adjustments
   - Referral fraud detection

4. **Notifications**
   - Notify referrer when someone uses their code
   - Reward notifications
   - Milestone achievement notifications

---

## Environment Variables

Add to `.env` file:

```env
# Frontend URL for share links
FRONTEND_URL=http://localhost:3000

# App name for share messages
APP_NAME=EClassify
```

---

## Security Considerations

1. **Referral Code Uniqueness**: Ensured via database UNIQUE constraint
2. **Self-Referral Prevention**: Backend validates user isn't using their own code
3. **Code Validation**: Referral code must exist before accepting signup
4. **Rate Limiting**: Consider adding rate limits to prevent abuse
5. **Fraud Detection**: Monitor for suspicious referral patterns (Phase 2)

---

## Troubleshooting

### Error: "Invalid referral code"
- Referral code doesn't exist in database
- Check if code was typed correctly
- Verify code hasn't been deleted

### Error: "Cannot use your own referral code"
- User tried to refer themselves
- This is prevented by backend validation

### Referral count not incrementing
- Check if `incrementReferralCount()` is being called
- Verify database trigger/constraint isn't blocking update
- Check for transaction rollback issues

---

## Support

For questions or issues, refer to:
- `API-Docs/referrals.md` - Complete API documentation
- `DATABASE-SCHEMA.md` - Database schema reference
- `API-Docs/otp-authentication.md` - Signup flow documentation
