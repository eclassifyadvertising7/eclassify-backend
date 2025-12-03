# Manual Payment Upload - Corrections Applied

## Issues Found and Fixed

After reviewing the reference implementation (uploadMiddleware.js, storageConfig.js, storageHelper.js), several corrections were made to align with the project's upload pattern.

---

## Changes Made

### 1. Upload Configuration (`src/config/temp/manualPaymentUploadConfig.js`)

**Before:**
- Used `multer-storage-cloudinary` package
- Directly configured Cloudinary storage in middleware
- Mixed storage logic with middleware

**After:**
- ✅ Uses `multer.memoryStorage()` for Cloudinary (like uploadMiddleware.js)
- ✅ Uses `multer.diskStorage()` for local storage
- ✅ Follows same pattern as other upload middlewares
- ✅ Uses `generateFileName()` for unique filenames
- ✅ Ensures directory exists before upload

**Key Changes:**
```javascript
// Now uses memory storage for Cloudinary
if (STORAGE_TYPE === 'cloudinary') {
  return multer.memoryStorage();
}

// Disk storage for local with proper path handling
return multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'manual_payments');
    await ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateFileName(file.originalname);
    cb(null, uniqueName);
  }
});
```

### 2. Controller (`src/controllers/temp/manualPaymentController.js`)

**Before:**
- Used custom `getFileDetails()` function
- Didn't use `storageConfig.uploadFile()`
- Inconsistent with project pattern

**After:**
- ✅ Uses `uploadFile()` from storageConfig for Cloudinary
- ✅ Uses `getRelativePath()` from storageHelper for local
- ✅ Follows same pattern as listingMediaService.js
- ✅ Proper error handling for upload failures

**Key Changes:**
```javascript
if (STORAGE_TYPE === 'cloudinary') {
  // Upload to Cloudinary using storageConfig
  const folder = 'uploads/manual_payments';
  const uploadResult = await uploadFile(
    req.file,
    folder,
    { resourceType: 'auto' }
  );

  fileDetails = {
    url: uploadResult.publicId, // Relative path
    storageType: 'cloudinary',
    mimeType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname
  };
} else {
  // Local storage - use getRelativePath
  const relativePath = getRelativePath(req.file.path);
  
  fileDetails = {
    url: relativePath,
    storageType: 'local',
    mimeType: req.file.mimetype,
    size: req.file.size,
    originalName: req.file.originalname
  };
}
```

### 3. URL Helper (`src/utils/temp/paymentProofHelper.js`)

**Before:**
- Manually constructed Cloudinary URLs
- Didn't use `cloudinary.url()` method
- Inconsistent with storageHelper.js pattern

**After:**
- ✅ Uses `cloudinary.url()` for proper URL generation
- ✅ Follows same pattern as storageHelper.js
- ✅ Handles MIME type to extension mapping
- ✅ Proper resource_type for PDFs

**Key Changes:**
```javascript
// Now uses cloudinary.url() like storageHelper.js
if (storageType === 'cloudinary') {
  const fullPublicId = `${CLOUDINARY_FOLDER}/${relativePath}`;
  
  return cloudinary.url(fullPublicId, { 
    format: ext,
    secure: true,
    resource_type: mimeType === 'application/pdf' ? 'raw' : 'image'
  });
}

// Local storage adds extension
return `${process.env.UPLOAD_URL}/${relativePath}.${ext}`;
```

---

## How It Works Now

### Upload Flow

1. **User Submits Form:**
   - Multer receives file
   - For Cloudinary: Stores in memory buffer
   - For Local: Saves to disk with unique filename

2. **Controller Processes:**
   - For Cloudinary: Calls `uploadFile()` with buffer
   - For Local: Gets relative path with `getRelativePath()`
   - Stores relative path in database

3. **Database Storage:**
   ```json
   {
     "url": "uploads/manual_payments/abc123",
     "storageType": "cloudinary",
     "mimeType": "image/jpeg",
     "size": 245678,
     "originalName": "proof.jpg"
   }
   ```

4. **URL Generation:**
   - Helper adds extension based on MIME type
   - For Cloudinary: Uses `cloudinary.url()` to generate signed URL
   - For Local: Appends extension to relative path

### Cloudinary Folder Structure

```
eclassify_app/
└── uploads/
    └── manual_payments/
        ├── abc123.jpg
        ├── def456.png
        └── ghi789.pdf
```

### Local Folder Structure

```
uploads/
└── manual_payments/
    ├── abc123.jpg
    ├── def456.png
    └── ghi789.pdf
```

---

## Alignment with Project Pattern

### ✅ Follows uploadMiddleware.js Pattern
- Memory storage for Cloudinary
- Disk storage for local
- Proper file filter
- Size limits

### ✅ Follows storageConfig.js Pattern
- Uses `uploadFile()` for Cloudinary uploads
- Stores relative paths in database
- Handles both buffer and file path inputs

### ✅ Follows storageHelper.js Pattern
- Uses `cloudinary.url()` for URL generation
- MIME type to extension mapping
- Adds extension for local storage

### ✅ Follows listingMediaService.js Pattern
- Checks storage type
- Calls `uploadFile()` for Cloudinary
- Uses `getRelativePath()` for local
- Stores metadata in database

---

## Testing

### Test Cloudinary Upload

```bash
# Set environment
export STORAGE_TYPE=cloudinary
export CLOUDINARY_CLOUD_NAME=your_cloud
export CLOUDINARY_API_KEY=your_key
export CLOUDINARY_API_SECRET=your_secret

# Upload proof
curl -X POST http://localhost:5000/api/manual-payments/subscribe \
  -H "Authorization: Bearer TOKEN" \
  -F "planId=1" \
  -F "upiId=test@paytm" \
  -F "transactionId=TEST123" \
  -F "paymentProof=@proof.jpg"

# Check Cloudinary dashboard
# Should see: eclassify_app/uploads/manual_payments/abc123.jpg
```

### Test Local Upload

```bash
# Set environment
export STORAGE_TYPE=local
export UPLOAD_URL=http://localhost:5000

# Upload proof
curl -X POST http://localhost:5000/api/manual-payments/subscribe \
  -H "Authorization: Bearer TOKEN" \
  -F "planId=1" \
  -F "upiId=test@paytm" \
  -F "transactionId=TEST123" \
  -F "paymentProof=@proof.jpg"

# Check local folder
ls uploads/manual_payments/
# Should see: abc123.jpg
```

### Test URL Generation

```bash
# List subscriptions
curl -X GET "http://localhost:5000/api/manual-payments/subscriptions?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check response includes fullUrl:
# Cloudinary: https://res.cloudinary.com/yourcloud/image/upload/eclassify_app/uploads/manual_payments/abc123.jpg
# Local: http://localhost:5000/uploads/manual_payments/abc123.jpg
```

---

## Summary

✅ **Upload middleware** now follows uploadMiddleware.js pattern
✅ **Controller** now uses storageConfig.uploadFile() and storageHelper
✅ **URL helper** now uses cloudinary.url() like storageHelper.js
✅ **Consistent** with project's upload implementation
✅ **Storage agnostic** - works with both Cloudinary and local
✅ **Proper paths** - relative in DB, full URLs in API responses

**All corrections applied and aligned with project patterns!** 🎉
