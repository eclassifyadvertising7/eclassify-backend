# 🚨 BREAKING CHANGE: Profile Photo Response Structure

## Overview
Profile photo has been moved from `users` table to `user_profiles` table. This affects all API responses that include user information.

---

## What Changed?

### Before (Old Structure)
```json
{
  "user": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePhoto": "http://localhost:5000/uploads/profiles/user-123.jpg"
  }
}
```

### After (New Structure)
```json
{
  "user": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profile": {
      "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-123/photo.jpg"
    }
  }
}
```

---

## Affected Endpoints

### 1. Profile Endpoints

#### GET /api/profile
**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profile": {
      "dob": "1990-01-01",
      "gender": "male",
      "about": "Software developer",
      "profilePhoto": "https://res.cloudinary.com/.../photo.jpg"
    }
  }
}
```

#### PATCH /api/profile
**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profile": {
      "dob": "1990-01-01",
      "profilePhoto": "https://res.cloudinary.com/.../photo.jpg"
    }
  }
}
```

#### GET /api/panel/users/:userId (Admin)
**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 456,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "profile": {
      "dob": "1995-05-15",
      "gender": "female",
      "profilePhoto": "https://res.cloudinary.com/.../photo.jpg"
    }
  }
}
```

---

### 2. Chat Endpoints

#### GET /api/end-user/chat-rooms
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "listingId": 123,
      "buyer": {
        "id": 789,
        "fullName": "John Doe",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/.../user-789/photo.jpg"
        }
      },
      "seller": {
        "id": 101,
        "fullName": "Jane Smith",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/.../user-101/photo.jpg"
        }
      }
    }
  ]
}
```

#### GET /api/end-user/chat-rooms/:roomId/messages
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "messageText": "Hello!",
      "sender": {
        "id": 789,
        "fullName": "John Doe",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/.../user-789/photo.jpg"
        }
      }
    }
  ]
}
```

---

### 3. Listing Endpoints

#### GET /api/listings/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "2020 Honda City",
    "price": "1500000.00",
    "user": {
      "id": 456,
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/.../user-456/photo.jpg"
      }
    }
  }
}
```

#### GET /api/public/listings/:slug
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "2020 Honda City",
    "slug": "2020-honda-city-abc123",
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/.../user-123/photo.jpg"
      }
    }
  }
}
```

---

### 4. Offer Endpoints

#### GET /api/end-user/offers/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "offeredAmount": "500000.00",
    "buyer": {
      "id": 789,
      "fullName": "John Doe",
      "email": "john@example.com",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/.../user-789/photo.jpg"
      }
    },
    "seller": {
      "id": 101,
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/.../user-101/photo.jpg"
      }
    }
  }
}
```

#### GET /api/end-user/chat-rooms/:roomId/offers
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "offeredAmount": "500000.00",
      "buyer": {
        "id": 789,
        "fullName": "John Doe",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/.../user-789/photo.jpg"
        }
      },
      "seller": {
        "id": 101,
        "fullName": "Jane Smith",
        "profile": {
          "profilePhoto": "https://res.cloudinary.com/.../user-101/photo.jpg"
        }
      }
    }
  ]
}
```

---

## Frontend Migration Guide

### React/Vue Example

**Before:**
```javascript
// ❌ Old - Direct access
<img src={user.profilePhoto} alt={user.fullName} />

// ❌ Old - Conditional
{user.profilePhoto && <img src={user.profilePhoto} />}
```

**After:**
```javascript
// ✅ New - Nested access with optional chaining
<img src={user.profile?.profilePhoto} alt={user.fullName} />

// ✅ New - Conditional
{user.profile?.profilePhoto && <img src={user.profile.profilePhoto} />}

// ✅ New - With fallback
<img 
  src={user.profile?.profilePhoto || '/default-avatar.png'} 
  alt={user.fullName} 
/>
```

### TypeScript Interface Update

**Before:**
```typescript
interface User {
  id: number;
  fullName: string;
  email: string;
  profilePhoto?: string;
}
```

**After:**
```typescript
interface User {
  id: number;
  fullName: string;
  email: string;
  profile?: {
    profilePhoto?: string;
    dob?: string;
    gender?: string;
    // ... other profile fields
  };
}
```

---

## Database Changes

### Migration Required
```sql
-- Create ENUM type for storage types
DO $$ BEGIN
    CREATE TYPE enum_storage_type AS ENUM ('local', 'cloudinary', 'aws', 'gcs', 'digital_ocean');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add profile photo columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN profile_photo TEXT,
ADD COLUMN profile_photo_storage_type enum_storage_type,
ADD COLUMN profile_photo_mime_type VARCHAR(50);

-- Optional: Migrate existing data from users.profile_photo
UPDATE user_profiles up
SET profile_photo = u.profile_photo,
    profile_photo_storage_type = 'local'
FROM users u
WHERE up.user_id = u.id AND u.profile_photo IS NOT NULL;
```

---

## Testing Checklist

- [ ] Update all API integration tests
- [ ] Update frontend user profile components
- [ ] Update chat UI components (user avatars)
- [ ] Update listing detail pages (seller info)
- [ ] Update offer components (buyer/seller avatars)
- [ ] Test with missing profile photos (null handling)
- [ ] Test with Cloudinary URLs
- [ ] Test with local storage URLs
- [ ] Verify optional chaining works correctly
- [ ] Check TypeScript types are updated

---

## Rollback Plan

If issues occur, you can temporarily add a virtual field to User model:

```javascript
// Temporary backward compatibility (NOT RECOMMENDED for production)
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  if (this.profile?.profilePhoto) {
    values.profilePhoto = this.profile.profilePhoto;
  }
  return values;
};
```

**Note:** This is only for emergency rollback. Update frontend code properly instead.

---

## Support

For questions or issues, contact the backend team or refer to:
- `PROFILE-PHOTO-CLOUDINARY-IMPLEMENTATION.md` - Implementation details
- `DATABASE-SCHEMA.md` - Schema documentation
- `.kiro/steering/structure.md` - Architecture guidelines
