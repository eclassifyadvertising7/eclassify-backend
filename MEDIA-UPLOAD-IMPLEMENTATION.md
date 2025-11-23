# Media Upload Implementation Summary

## Overview

Updated the listings module to support both **images and videos** with a user-based folder structure.

---

## Folder Structure

### Final Structure (Implemented)

```
uploads/
└── listings/
    ├── user-123/
    │   ├── images/
    │   │   ├── car-front-abc123.jpg
    │   │   ├── car-side-def456.jpg
    │   │   └── house-front-ghi789.jpg
    │   └── videos/
    │       ├── car-tour-xyz789.mp4
    │       └── property-walkthrough-mno345.mp4
    └── user-456/
        ├── images/
        └── videos/
```

**Path Format:**
- Images: `uploads/listings/user-{userId}/images/{filename}`
- Videos: `uploads/listings/user-{userId}/videos/{filename}`

### Benefits

✅ **User-level organization** - All media for a user in one place  
✅ **Media type separation** - Images and videos in separate folders  
✅ **Easy cleanup** - Delete entire user folder when needed  
✅ **GDPR compliant** - Easy to remove all user data  
✅ **No conflicts** - Unique filenames generated with timestamp + random chars  
✅ **Simple structure** - Only 4 levels deep  

---

## Changes Made

### 1. Upload Configuration (`src/config/uploadConfig.js`)

**Before:**
```javascript
LISTING_IMAGE: {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 15,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
}
```

**After:**
```javascript
LISTING_MEDIA: {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 15,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 80
  },
  VIDEO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 3,
    maxDuration: 60, // seconds
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    allowedExtensions: ['.mp4', '.mov', '.avi']
  }
}
```

---

### 2. Upload Middleware (`src/middleware/uploadMiddleware.js`)

**Updated `createStorage()` function:**
- Detects if upload is for listings
- Creates user-based folder structure: `uploads/listings/user-{userId}/{images|videos}/`
- Falls back to date-based structure for other upload types

**Added new middleware:**
- `uploadListingImages` - Images only (max 15, 5MB each)
- `uploadListingVideos` - Videos only (max 3, 50MB each)
- `uploadListingMedia` - Both images and videos (auto-detects type)

**Usage:**
```javascript
// Single endpoint for both images and videos
router.post('/media/:id', uploadListingMedia, ListingController.uploadMedia);
```

---

### 3. Media Service (`src/services/listingMediaService.js`)

**Updated `uploadMedia()` method:**
- Accepts mixed array of images and videos
- Automatically separates by MIME type
- Validates limits separately (15 images + 3 videos)
- Processes images (compression, optimization)
- Stores videos as-is (no processing yet)
- Returns partial success with errors array if some files fail

**Updated `delete()` method:**
- Detects media type (image or video)
- Uses appropriate service for deletion (imageService or videoService)

**Response format:**
```javascript
{
  success: true,
  message: "Media uploaded successfully",
  data: [...uploadedMedia],
  errors: [...failedUploads] // Optional, only if some failed
}
```

---

### 4. Video Service (`src/services/videoService.js`) - NEW

Created placeholder service for future video processing:

**Current features:**
- ✅ Get video metadata (basic file info)
- ✅ Delete video files
- ✅ Delete multiple videos

**Future features (requires ffmpeg):**
- ⏳ Generate video thumbnails
- ⏳ Extract video duration
- ⏳ Validate video duration
- ⏳ Video compression/optimization

**To enable video processing:**
```bash
# Install ffmpeg system package
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from ffmpeg.org

# Install Node.js package
npm install fluent-ffmpeg
```

---

### 5. Controller (`src/controllers/end-user/listingController.js`)

**Updated `uploadMedia()` method:**
- Accepts mixed media files
- Returns 207 Multi-Status if partial success
- Returns 201 Created if all files uploaded successfully

---

### 6. Routes (`src/routes/end-user/listingRoutes.js`)

**Updated import:**
```javascript
import { uploadListingMedia } from '#middleware/uploadMiddleware.js';
```

**Updated route:**
```javascript
router.post('/media/:id', uploadListingMedia, ListingController.uploadMedia);
```

---

### 7. API Documentation (`API-Docs/listings.md`)

**Updated:**
- Media upload endpoint documentation
- Added video support details
- Added folder structure information
- Updated cURL examples
- Added 207 Multi-Status response example

---

## Media Limits

| Type | Max Files | Max Size | Formats |
|------|-----------|----------|---------|
| Images | 15 per listing | 5MB each | JPEG, PNG, WebP |
| Videos | 3 per listing | 50MB each | MP4, MOV, AVI |

---

## API Usage

### Upload Mixed Media

**Endpoint:** `POST /api/end-user/listings/media/:id`

**Request:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/image2.jpg" \
  -F "media=@/path/to/video.mp4"
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": [
    {
      "id": 1,
      "listingId": 123,
      "mediaType": "image",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/image1-abc123.jpg",
      "isPrimary": true
    },
    {
      "id": 2,
      "listingId": 123,
      "mediaType": "video",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/videos/video-xyz789.mp4",
      "isPrimary": false
    }
  ]
}
```

**Response (Partial Success - 207 Multi-Status):**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": [
    {
      "id": 1,
      "listingId": 123,
      "mediaType": "image",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/image1-abc123.jpg",
      "isPrimary": true
    }
  ],
  "errors": [
    {
      "file": "large-video.mp4",
      "error": "File size exceeds maximum limit"
    }
  ]
}
```

---

## File Naming

Files are automatically renamed using `generateFileName()` from `customSlugify.js`:

**Format:** `{original-name}-{timestamp}-{random}.{ext}`

**Example:**
- Original: `my-car-photo.jpg`
- Stored as: `my-car-photo-1732368000000-a1b2c3.jpg`

**Benefits:**
- ✅ No filename conflicts
- ✅ Preserves original name (for debugging)
- ✅ Timestamp for sorting
- ✅ Random suffix for uniqueness

---

## Validation

### Image Validation
- ✅ File type: JPEG, PNG, WebP only
- ✅ File size: Max 5MB
- ✅ Count limit: Max 15 per listing
- ✅ Auto-compression and optimization
- ✅ Thumbnail generation

### Video Validation
- ✅ File type: MP4, MOV, AVI only
- ✅ File size: Max 50MB
- ✅ Count limit: Max 3 per listing
- ⏳ Duration validation (requires ffmpeg)
- ⏳ Thumbnail generation (requires ffmpeg)

---

## Error Handling

### Upload Errors
- Invalid file type → Rejected by multer
- File too large → Rejected by multer
- Limit exceeded → Rejected by service
- Processing failed → Partial success (207 status)

### Cleanup on Error
- If upload fails, all uploaded files are automatically deleted
- No orphaned files left in storage

---

## Future Enhancements

### Video Processing (Requires ffmpeg)

1. **Thumbnail Generation**
   - Extract frame at 1 second
   - Generate 300x? thumbnail
   - Store in images folder

2. **Duration Extraction**
   - Get video duration
   - Store in `duration_seconds` field
   - Validate against max duration (60s)

3. **Video Optimization**
   - Compress videos
   - Convert to web-friendly format
   - Generate multiple quality versions

### Implementation Steps

```bash
# 1. Install ffmpeg
sudo apt-get install ffmpeg  # Ubuntu/Debian
brew install ffmpeg          # macOS

# 2. Install Node.js package
npm install fluent-ffmpeg

# 3. Update videoService.js with actual implementation
# 4. Enable thumbnail generation in uploadMedia()
# 5. Enable duration validation
```

---

## Testing

### Test Image Upload
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@test-image.jpg"
```

### Test Video Upload
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@test-video.mp4"
```

### Test Mixed Upload
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@image1.jpg" \
  -F "media=@image2.jpg" \
  -F "media=@video.mp4"
```

### Verify Folder Structure
```bash
ls -la uploads/listings/user-*/images/
ls -la uploads/listings/user-*/videos/
```

---

## Files Modified

1. ✅ `src/config/uploadConfig.js` - Added video config
2. ✅ `src/middleware/uploadMiddleware.js` - Updated storage logic, added video middleware
3. ✅ `src/services/listingMediaService.js` - Updated upload and delete logic
4. ✅ `src/services/videoService.js` - NEW - Video processing service
5. ✅ `src/controllers/end-user/listingController.js` - Updated upload handler
6. ✅ `src/routes/end-user/listingRoutes.js` - Updated middleware import
7. ✅ `API-Docs/listings.md` - Updated documentation

---

## Summary

✅ **Video support added** - Users can upload both images and videos  
✅ **User-based folders** - `uploads/listings/user-{userId}/{images|videos}/`  
✅ **Separate limits** - 15 images + 3 videos per listing  
✅ **Auto-detection** - Middleware automatically routes to correct folder  
✅ **Partial success** - Returns 207 status if some files fail  
✅ **Future-ready** - Video service ready for ffmpeg integration  
✅ **Zero diagnostics errors** - All code passes validation  

**Implementation complete and ready for testing!** 🚀
