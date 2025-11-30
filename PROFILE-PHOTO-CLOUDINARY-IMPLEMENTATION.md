# Profile Photo Cloudinary Implementation

## Summary
Profile photos now support Cloudinary storage with the same storage-agnostic approach as listing media and chat images.

## Changes Made

### 1. Database Schema
**Added to `user_profiles` table:**
- `profile_photo` (TEXT) - Relative path
- `profile_photo_storage_type` (VARCHAR(20)) - 'local' or 'cloudinary'
- `profile_photo_mime_type` (VARCHAR(50)) - MIME type for URL generation

**Removed from `users` table:**
- `profile_photo` column removed from model (kept in DB for backward compatibility)

### 2. Model Updates
**UserProfile Model:**
- Added `profilePhoto`, `profilePhotoStorageType`, `profilePhotoMimeType` fields
- Added getter to convert relative path to full URL using `getFullUrl()`

**User Model:**
- Removed `profilePhoto` field and getter
- Removed `getFullUrl` import

### 3. Service Layer
**ProfileService:**
- Implemented `_uploadProfilePhoto()` method using `uploadFile()` from `storageConfig.js`
- Implemented `_optimizeImage()` for Sharp image processing
- Updated `updateProfile()` to handle Cloudinary uploads
- Updated `deleteProfilePhoto()` to use `deleteFile()` from `storageConfig.js`

### 4. Repository Layer
**ProfileRepository:**
- Added profile photo columns to `getUserWithProfile()` query
- Removed `profilePhoto` from user attributes

### 5. Folder Structure
**Cloudinary:**
```
eclassify_app/
  uploads/
    profiles/
      user-{userId}/
        profile-photo-{timestamp}.jpg
```

**Local:**
```
uploads/
  profiles/
    user-{userId}/
      profile-photo-{timestamp}.jpg
```

## Migration

### For New Installations
Run migrations normally - profile photo columns are included in `user_profiles` table creation.

### For Existing Databases
Run this SQL:
```sql
ALTER TABLE user_profiles 
ADD COLUMN profile_photo TEXT,
ADD COLUMN profile_photo_storage_type VARCHAR(20),
ADD COLUMN profile_photo_mime_type VARCHAR(50);
```

Optional data migration (if you have existing photos in `users.profile_photo`):
```sql
UPDATE user_profiles up
SET profile_photo = u.profile_photo,
    profile_photo_storage_type = 'local'
FROM users u
WHERE up.user_id = u.id AND u.profile_photo IS NOT NULL;
```

## API Usage

### Upload Profile Photo
```javascript
// Request
POST /api/profile
Content-Type: multipart/form-data

{
  fullName: "John Doe",
  profilePhoto: <file>
}

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "profile": {
      "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-123/photo.jpg"
    }
  }
}
```

### Delete Profile Photo
```javascript
// Request
DELETE /api/profile/photo

// Response
{
  "success": true,
  "message": "Profile photo deleted successfully"
}
```

## Configuration

### Environment Variables
```env
STORAGE_TYPE=cloudinary  # or 'local'
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=eclassify_app
UPLOAD_URL=http://localhost:5000  # For local storage
```

### Upload Config
Profile photo settings in `src/config/uploadConfig.js`:
```javascript
PROFILE_PHOTO: {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 1920,
  maxHeight: 1920,
  thumbnailSize: 150,
  quality: 80
}
```

### Supported Storage Types
- `local` - Local file system storage
- `cloudinary` - Cloudinary cloud storage
- `aws` - Amazon S3 (future implementation)
- `gcs` - Google Cloud Storage (future implementation)
- `digital_ocean` - Digital Ocean Spaces (future implementation)

## Benefits

1. **Storage Agnostic** - Switch between multiple storage providers without code changes
2. **Consistent Architecture** - Same pattern as listing media and chat images
3. **Proper Data Modeling** - Profile data in profile table, not user table
4. **No Performance Impact** - Profile already fetched with user in most queries
5. **Cloudinary Folder Structure** - Organized folders in Cloudinary dashboard via `asset_folder` parameter

## Files Modified

- `migrations/20250126000001-create-user-profiles-table.js`
- `src/models/UserProfile.js`
- `src/models/User.js`
- `src/services/profileService.js`
- `src/repositories/profileRepository.js`
- `DATABASE-SCHEMA.md`
- `.kiro/steering/structure.md`

## Files Created

- `ALTER_TABLES_PROFILE_PHOTO.sql` - SQL for existing databases
- `PROFILE-PHOTO-CLOUDINARY-IMPLEMENTATION.md` - This document
