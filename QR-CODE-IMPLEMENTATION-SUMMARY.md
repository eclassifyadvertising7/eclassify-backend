# QR Code Implementation Summary

## Overview

Added QR code upload and retrieval functionality for manual payment system.

## Files Created/Modified

### New Files
1. **src/repositories/otherMediaRepository.js** - Production-level repository for OtherMedia model
2. **QR-CODE-IMPLEMENTATION-SUMMARY.md** - This file

### Modified Files
1. **src/utils/temp/paymentProofHelper.js** → **src/utils/temp/manualPaymentHelper.js** (renamed)
   - Renamed `getPaymentProofUrl()` to `getManualPaymentMediaUrl()`
   - Updated to handle both payment proofs and QR codes

2. **src/config/temp/manualPaymentUploadConfig.js**
   - Added `uploadQRCode` middleware for QR code uploads
   - Max size: 2MB, formats: JPG/PNG only

3. **src/services/temp/manualPaymentService.js**
   - Added `storeQRCode()` - Upload/replace QR code (Super Admin)
   - Added `getQRCode()` - Retrieve QR code (Public)
   - Added `_generateAlphaNumericCode()` helper

4. **src/controllers/temp/manualPaymentController.js**
   - Added `storeQRCode` - Upload QR code endpoint
   - Added `getQRCode` - Get QR code endpoint

5. **src/routes/temp/manualPaymentRoutes.js**
   - Split into 3 routers: `endUserRouter`, `panelRouter`, `publicRouter`
   - Added POST `/api/panel/manual-payments/qr-code` (Super Admin)
   - Added GET `/api/public/manual-payments/qr-code` (Public)

6. **src/routes/index.js**
   - Mounted `publicRouter` at `/api/public/manual-payments`

7. **API-Docs/manual-payment-verification.md**
   - Added QR Code Management section
   - Updated endpoints table

## API Endpoints

### Super Admin
- **POST** `/api/panel/manual-payments/qr-code` - Upload/replace QR code
  - Content-Type: `multipart/form-data`
  - Field: `qrCode` (file, max 2MB, JPG/PNG)
  - Replaces existing QR code if present

### Public
- **GET** `/api/public/manual-payments/qr-code` - Get current QR code
  - No authentication required
  - Returns full URL with model getter

## Storage Details

### Cloudinary
- **Folder:** `eclassify_app/uploads/manual-payment-qr/`
- **Database:** `uploads/manual-payment-qr/filename.jpg`

### Local
- **Folder:** `uploads/manual-payment-qr/`
- **Database:** `uploads/manual-payment-qr/filename.jpg`

## Database

Uses existing `other_media` table with:
- `identifier_slug`: `'manual-payment-qr'`
- `slug`: Generated using `customSlugify() + generateAlphaNumericCode(4)`
- Only one QR code stored at a time (old one deleted on upload)

## Key Features

1. **Single QR Code:** Only one QR code record exists at a time (identifier_slug: 'manual-payment-qr')
2. **Update Existing Record:** Uploading new QR code deletes old file from storage and updates existing database record
3. **Storage Agnostic:** Works with both local and Cloudinary
4. **URL Generation:** Model getters handle full URL generation
5. **Public Access:** QR code retrieval requires no authentication

## Behavior

- **First Upload:** Creates new record with identifier_slug 'manual-payment-qr'
- **Subsequent Uploads:** 
  1. Deletes old file from Cloudinary/local storage
  2. Updates existing database record with new file details
  3. Keeps same ID and identifier_slug
  4. Returns "QR code updated successfully"

## Testing

```bash
# Upload QR code (Super Admin)
curl -X POST http://localhost:5000/api/panel/manual-payments/qr-code \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "qrCode=@/path/to/qr.png"

# Get QR code (Public)
curl -X GET http://localhost:5000/api/public/manual-payments/qr-code
```

## Notes

- All files in `temp/` folder should be deleted when payment gateway is implemented
- OtherMedia repository is production-level (not temporary)
- QR code functionality follows same pattern as listing media
