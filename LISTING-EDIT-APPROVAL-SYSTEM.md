# Listing Edit & Approval System

## Overview

This document defines the complete specification for allowing users to edit their approved listings with a two-tier approval system. Changes to sensitive fields (text and images) require admin approval while keeping the original listing visible. Non-sensitive fields update instantly.

**Status:** Specification Complete - Ready for Implementation (Next Month)

---

## Business Requirements

### Problem Statement
Users need to edit their approved listings, but allowing unrestricted edits could lead to:
- Spam and inappropriate content
- Misleading information
- Abuse of the platform

### Solution
Two-tier edit system:
1. **Instant Updates:** Safe fields (numbers, dropdowns, booleans) update immediately
2. **Approval Required:** Text fields and images go through admin review while original listing remains visible

---

## Field Classification

### Instant Update Fields (No Approval Required)

**Listing Table:**
- `price` - Decimal (validated by frontend)
- `priceNegotiable` - Boolean
- `stateId`, `cityId` - Foreign keys (dropdown)
- `latitude`, `longitude` - Decimal
- `pincode` - String (validated)
- `postedByType` - ENUM (dropdown)

**CarListing Table:**
- `brandId`, `modelId`, `variantId` - Foreign keys (dropdown)
- `year`, `registrationYear` - Integer (validated)
- `condition` - ENUM (dropdown: new/used)
- `mileageKm` - Integer (validated)
- `ownersCount` - Integer (validated)
- `fuelType` - ENUM (dropdown)
- `transmission` - ENUM (dropdown)
- `bodyType` - ENUM (dropdown)
- `engineCapacityCc`, `powerBhp`, `seats` - Integer (validated)
- `registrationStateId` - Foreign key (dropdown)
- `insuranceValidUntil` - Date
- `features` - JSON (predefined selectable options)

**PropertyListing Table:**
- `propertyType`, `listingType` - ENUM (dropdown)
- `bedrooms`, `bathrooms`, `balconies` - Integer (validated)
- `areaSqft`, `plotAreaSqft`, `carpetAreaSqft` - Integer (validated)
- `floorNumber`, `totalFloors`, `ageYears` - Integer (validated)
- `facing` - ENUM (dropdown)
- `furnished` - ENUM (dropdown)
- `parkingSpaces` - Integer (validated)
- `availableFrom` - Date
- `ownershipType` - ENUM (dropdown)
- `reraApproved` - Boolean
- `amenities` - JSON (predefined selectable options)

### Approval Required Fields

**Listing Table:**
- `title` - VARCHAR(200) - High risk for spam/misleading content
- `description` - TEXT - High risk for spam/scams/inappropriate content
- `locality` - VARCHAR(200) - Risk of fake locations
- `address` - TEXT - Risk of fake/inappropriate addresses
- `keywords` - TEXT - Risk of SEO spam

**CarListing Table:**
- `color` - VARCHAR(50) - Free text field
- `registrationNumber` - VARCHAR(20) - Risk of fake/inappropriate data
- `vinNumber` - VARCHAR(17) - Risk of fake data

**PropertyListing Table:**
- `reraId` - VARCHAR(50) - Risk of fake RERA IDs

**Images:**
- All listing images (new additions, deletions, replacements)
- Exception: Changing cover photo to existing approved image = instant update

---

## Database Schema

### Table: `listing_edits`

Stores pending changes for text fields and image operations.

```sql
CREATE TABLE listing_edits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  
  -- Text fields that need approval (only store if changed)
  title VARCHAR(200) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  locality VARCHAR(200) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  keywords TEXT DEFAULT NULL,
  
  -- CarListing text fields
  color VARCHAR(50) DEFAULT NULL,
  registration_number VARCHAR(20) DEFAULT NULL,
  vin_number VARCHAR(17) DEFAULT NULL,
  
  -- PropertyListing text fields
  rera_id VARCHAR(50) DEFAULT NULL,
  
  -- Image operations tracking
  images_to_delete JSON DEFAULT NULL,  -- Array of listing_media IDs to delete
  has_new_images BOOLEAN DEFAULT FALSE,  -- True if new images added
  new_cover_from_pending BOOLEAN DEFAULT FALSE,  -- True if new image should be cover
  
  -- Edit metadata
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT DEFAULT NULL,  -- Admin feedback on rejection
  reviewed_by BIGINT DEFAULT NULL,  -- Admin who reviewed
  reviewed_at TIMESTAMP DEFAULT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_listing_id (listing_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Only one pending edit per listing
CREATE UNIQUE INDEX idx_one_pending_edit 
ON listing_edits(listing_id, status) 
WHERE status = 'pending';
```

### Table: `listing_edit_media`

Stores new images uploaded during edit (pending approval).

```sql
CREATE TABLE listing_edit_media (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  listing_edit_id BIGINT NOT NULL,
  
  -- Image data
  media_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  media_type ENUM('image', 'video') DEFAULT 'image',
  storage_type ENUM('local', 'cloudinary') NOT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  thumbnail_mime_type VARCHAR(100) DEFAULT NULL,
  display_order INT DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,  -- True if this should be the cover image
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  FOREIGN KEY (listing_edit_id) REFERENCES listing_edits(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_listing_edit_id (listing_edit_id),
  INDEX idx_display_order (display_order)
);
```

---

## System Flow

### User Edit Flow

```
1. User clicks "Edit Listing" on approved listing
   ↓
2. Frontend sends PATCH request with ALL changed fields
   ↓
3. Backend splits changes into two groups:
   - Instant fields → Apply directly to listings/car_listings/property_listings
   - Approval fields → Store in listing_edits table
   ↓
4. Response indicates what happened:
   - All instant → "Listing updated successfully"
   - All approval → "Changes submitted for approval"
   - Mixed → "Some changes applied instantly, others pending approval"
   ↓
5. Original listing remains visible with old content for approval fields
```

### Admin Review Flow

```
1. Admin views pending edits list
   ↓
2. Admin clicks on specific edit to review
   ↓
3. System shows side-by-side comparison:
   - Left: Current approved content
   - Right: Proposed changes
   ↓
4. Admin decides:
   
   APPROVE:
   - Copy text fields from listing_edits to listings/car_listings/property_listings
   - Delete images marked in images_to_delete from listing_media
   - Copy images from listing_edit_media to listing_media
   - Update listing_edits.status = 'approved'
   - Notify user
   - Keep record for audit trail
   
   REJECT:
   - Update listing_edits.status = 'rejected'
   - Add admin_notes with reason
   - Delete images from listing_edit_media (cleanup storage)
   - Notify user with rejection reason
   - Keep record for audit trail
```

### Image Handling Details

**Scenario 1: User adds new images**
```
- New images uploaded to listing_edit_media
- has_new_images = true
- On approval: Copy to listing_media
```

**Scenario 2: User deletes existing images**
```
- Store IDs in images_to_delete: [45, 67, 89]
- Original images remain in listing_media
- On approval: Delete from listing_media and storage
```

**Scenario 3: User adds and deletes images**
```
- images_to_delete: [45, 67]
- New images in listing_edit_media
- On approval: Delete old, add new
```

**Scenario 4: User changes cover photo to existing approved image**
```
- Update listing_media.is_cover instantly (no approval needed)
- No entry in listing_edits
```

**Scenario 5: User sets new pending image as cover**
```
- Mark image in listing_edit_media with is_cover = true
- new_cover_from_pending = true
- On approval: Set as cover in listing_media
```

---

## API Endpoints

### End-User Endpoints

#### 1. Edit Listing (Mixed Update)
```
PATCH /api/end-user/listings/:id
```

**Request Body:**
```json
{
  "instantFields": {
    "price": 450000,
    "priceNegotiable": true,
    "bedrooms": 3,
    "bathrooms": 2,
    "stateId": 12,
    "cityId": 456
  },
  "approvalFields": {
    "title": "Updated title here",
    "description": "Updated description...",
    "locality": "New locality"
  },
  "imageOperations": {
    "deleteImageIds": [45, 67],
    "newImages": [
      {
        "file": "base64_or_multipart",
        "displayOrder": 0,
        "isCover": true
      }
    ]
  },
  "coverPhotoChange": {
    "existingImageId": 89  // Change cover to existing approved image (instant)
  }
}
```

**Response (Mixed Changes):**
```json
{
  "success": true,
  "message": "Some changes applied instantly. Text/image changes submitted for approval.",
  "data": {
    "instantUpdates": ["price", "priceNegotiable", "bedrooms", "bathrooms"],
    "pendingApproval": ["title", "description", "locality", "images"],
    "requiresApproval": true,
    "pendingEditId": 123
  }
}
```

**Response (Only Instant):**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "data": {
    "requiresApproval": false
  }
}
```

**Response (Only Approval):**
```json
{
  "success": true,
  "message": "Changes submitted for approval. Your listing remains visible with old content.",
  "data": {
    "requiresApproval": true,
    "pendingFields": ["title", "description", "images"],
    "pendingEditId": 123
  }
}
```

#### 2. View Pending Edit
```
GET /api/end-user/listings/:id/pending-edit
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingEdit": {
      "id": 123,
      "status": "pending",
      "submittedAt": "2025-01-15T10:30:00Z",
      "changes": {
        "title": "New title",
        "description": "New description",
        "imagesToDelete": [45, 67],
        "newImages": [
          {
            "url": "https://...",
            "thumbnailUrl": "https://...",
            "isCover": true
          }
        ]
      }
    },
    "currentListing": {
      "title": "Old title",
      "description": "Old description",
      "images": [...]
    }
  }
}
```

#### 3. Update Pending Edit
```
PATCH /api/end-user/listings/:id/pending-edit
```

**Behavior:** Replaces entire pending edit with new changes (not merge).

**Request Body:** Same as Edit Listing endpoint

**Response:**
```json
{
  "success": true,
  "message": "Pending edit updated successfully",
  "data": {
    "pendingEditId": 123
  }
}
```

#### 4. Cancel Pending Edit
```
DELETE /api/end-user/listings/:id/pending-edit
```

**Response:**
```json
{
  "success": true,
  "message": "Pending edit cancelled successfully"
}
```

### Panel (Admin) Endpoints

#### 1. List Pending Edits
```
GET /api/panel/listing-edits
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (pending/approved/rejected)
- `userId` (filter by user)
- `categoryId` (filter by category)
- `sortBy` (created_at/reviewed_at)
- `sortOrder` (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "edits": [
      {
        "id": 123,
        "listingId": 456,
        "listingTitle": "Original listing title",
        "userId": 789,
        "userName": "John Doe",
        "status": "pending",
        "submittedAt": "2025-01-15T10:30:00Z",
        "changedFields": ["title", "description", "images"],
        "hasImageChanges": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### 2. View Edit Details (Side-by-Side Comparison)
```
GET /api/panel/listing-edits/:id/compare
```

**Response:**
```json
{
  "success": true,
  "data": {
    "editId": 123,
    "listingId": 456,
    "status": "pending",
    "submittedAt": "2025-01-15T10:30:00Z",
    "user": {
      "id": 789,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "comparison": {
      "title": {
        "current": "Old title here",
        "proposed": "New updated title"
      },
      "description": {
        "current": "Old description...",
        "proposed": "New description..."
      },
      "locality": {
        "current": "Old locality",
        "proposed": "New locality"
      },
      "images": {
        "current": [
          {
            "id": 45,
            "url": "https://...",
            "isCover": true,
            "markedForDeletion": true
          },
          {
            "id": 67,
            "url": "https://...",
            "markedForDeletion": true
          },
          {
            "id": 89,
            "url": "https://...",
            "markedForDeletion": false
          }
        ],
        "proposed": [
          {
            "url": "https://...",
            "thumbnailUrl": "https://...",
            "isCover": true,
            "isNew": true
          },
          {
            "url": "https://...",
            "thumbnailUrl": "https://...",
            "isNew": true
          }
        ]
      }
    }
  }
}
```

#### 3. Approve Edit
```
POST /api/panel/listing-edits/:id/approve
```

**Request Body:**
```json
{
  "adminNotes": "Approved - looks good"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Edit approved successfully. Listing updated.",
  "data": {
    "listingId": 456,
    "editId": 123
  }
}
```

**Backend Actions:**
1. Copy text fields from listing_edits to listings/car_listings/property_listings
2. Delete images in images_to_delete from listing_media and storage
3. Copy images from listing_edit_media to listing_media
4. Update listing_edits: status='approved', reviewed_by, reviewed_at
5. Send notification to user
6. Keep listing_edits record for audit trail

#### 4. Reject Edit
```
POST /api/panel/listing-edits/:id/reject
```

**Request Body:**
```json
{
  "adminNotes": "Title contains inappropriate content. Please revise."  // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Edit rejected successfully. User notified.",
  "data": {
    "editId": 123
  }
}
```

**Backend Actions:**
1. Update listing_edits: status='rejected', admin_notes, reviewed_by, reviewed_at
2. Delete images from listing_edit_media and storage (cleanup)
3. Send notification to user with rejection reason
4. Keep listing_edits record for audit trail

---

## Business Rules

### Edit Restrictions

1. **Only approved listings can be edited**
   - Status must be 'active' (approved and not expired)
   - Draft, pending, rejected, expired, sold listings cannot be edited

2. **User must own the listing**
   - userId must match authenticated user
   - No editing other users' listings

3. **One pending edit per listing**
   - If pending edit exists, user can only update or cancel it
   - Cannot create new pending edit until current one is resolved

4. **No edit frequency limit**
   - Users can submit edits as many times as needed
   - Each update replaces previous pending edit

5. **No auto-expiry of pending edits**
   - Pending edits remain until admin reviews or user cancels

### Approval Rules

1. **Keep edit history**
   - Approved and rejected records remain in database
   - Provides audit trail for compliance

2. **Admin notifications**
   - No automatic notification to admins on edit submission
   - Admins check pending edits dashboard periodically

3. **User notifications**
   - Notify user only when edit is approved
   - Include rejection reason if rejected
   - No notification on submission

### Image Handling Rules

1. **Cover photo change to existing approved image**
   - Instant update, no approval needed
   - Update listing_media.is_cover directly

2. **New images as cover**
   - Requires approval
   - Mark in listing_edit_media with is_cover=true

3. **Image deletion**
   - Store IDs in images_to_delete JSON array
   - Delete from storage only after approval

4. **Image storage cleanup**
   - On approval: Delete old images from storage
   - On rejection: Delete pending images from storage
   - Keep approved images always

---

## Implementation Checklist

### Database
- [ ] Create migration for `listing_edits` table
- [ ] Create migration for `listing_edit_media` table
- [ ] Create `ListingEdit` model
- [ ] Create `ListingEditMedia` model
- [ ] Register models in `src/models/index.js`
- [ ] Define associations (ListingEdit → Listing, User, ListingEditMedia)

### Repositories
- [ ] Create `listingEditRepository.js`
  - [ ] `create(editData)`
  - [ ] `findById(id)`
  - [ ] `findPendingByListingId(listingId)`
  - [ ] `update(id, editData)`
  - [ ] `delete(id)`
  - [ ] `findAllPending(filters, pagination)`
  - [ ] `approve(id, reviewerId, adminNotes)`
  - [ ] `reject(id, reviewerId, adminNotes)`
  - [ ] `getComparisonData(id)`

### Services
- [ ] Create `listingEditService.js`
  - [ ] `submitEdit(listingId, userId, changes)` - Split instant/approval fields
  - [ ] `updatePendingEdit(listingId, userId, changes)` - Replace pending edit
  - [ ] `cancelPendingEdit(listingId, userId)` - Delete pending edit
  - [ ] `getPendingEdit(listingId, userId)` - Get user's pending edit
  - [ ] `listPendingEdits(filters, pagination)` - Admin list
  - [ ] `getEditComparison(editId)` - Side-by-side comparison
  - [ ] `approveEdit(editId, adminId, adminNotes)` - Apply changes
  - [ ] `rejectEdit(editId, adminId, adminNotes)` - Reject with reason
- [ ] Update `listingService.js`
  - [ ] Add method to check if listing has pending edit
  - [ ] Add method to apply instant field updates

### Controllers
- [ ] Update `src/controllers/end-user/listingController.js`
  - [ ] `editListing` - Handle mixed updates
  - [ ] `getPendingEdit` - View pending changes
  - [ ] `updatePendingEdit` - Update pending edit
  - [ ] `cancelPendingEdit` - Cancel pending edit
- [ ] Create `src/controllers/panel/listingEditController.js`
  - [ ] `listPendingEdits` - List all pending edits
  - [ ] `getEditComparison` - Side-by-side view
  - [ ] `approveEdit` - Approve changes
  - [ ] `rejectEdit` - Reject with reason

### Routes
- [ ] Update `src/routes/end-user/listingRoutes.js`
  - [ ] `PATCH /listings/:id` - Edit listing
  - [ ] `GET /listings/:id/pending-edit` - View pending
  - [ ] `PATCH /listings/:id/pending-edit` - Update pending
  - [ ] `DELETE /listings/:id/pending-edit` - Cancel pending
- [ ] Create `src/routes/panel/listingEditRoutes.js`
  - [ ] `GET /listing-edits` - List pending
  - [ ] `GET /listing-edits/:id/compare` - Comparison view
  - [ ] `POST /listing-edits/:id/approve` - Approve
  - [ ] `POST /listing-edits/:id/reject` - Reject

### Middleware
- [ ] Add validation for edit requests
- [ ] Add permission checks (user owns listing, admin role)
- [ ] Add file upload handling for new images

### Notifications
- [ ] Update `userNotificationService.js`
  - [ ] `notifyEditApproved(userId, listingId)`
  - [ ] `notifyEditRejected(userId, listingId, reason)`

### Utilities
- [ ] Create helper to split instant vs approval fields
- [ ] Create helper to compare old vs new data
- [ ] Update image upload helper for edit images

### Documentation
- [ ] Update `API-Docs/listings.md` with edit endpoints
- [ ] Update `DATABASE-SCHEMA.md` with new tables
- [ ] Create admin guide for reviewing edits

---

## Testing Scenarios

### End-User Tests
1. Edit listing with only instant fields → Immediate update
2. Edit listing with only approval fields → Pending edit created
3. Edit listing with mixed fields → Partial update + pending edit
4. Update existing pending edit → Replace previous pending edit
5. Cancel pending edit → Delete pending edit
6. Try to edit listing with existing pending edit → Update or cancel flow
7. Change cover photo to existing image → Instant update
8. Add new images and set as cover → Pending approval
9. Delete images and add new ones → Track both operations

### Admin Tests
1. View list of pending edits with filters
2. View side-by-side comparison of changes
3. Approve edit → Changes applied to listing
4. Reject edit with reason → User notified
5. View edit history (approved/rejected records)

### Edge Cases
1. User deletes all images and adds new ones
2. User changes cover photo multiple times
3. User submits edit, then updates it before admin reviews
4. Admin approves edit while user is updating it (race condition)
5. Listing deleted while pending edit exists (CASCADE delete)

---

## Security Considerations

1. **Authorization**
   - Users can only edit their own listings
   - Admins can only approve/reject, not edit content directly

2. **Validation**
   - Validate all text fields for length and content
   - Sanitize HTML/scripts from text inputs
   - Validate image file types and sizes
   - Validate foreign key references (stateId, cityId, etc.)

3. **Rate Limiting**
   - Consider rate limiting edit submissions per user
   - Prevent spam/abuse of edit system

4. **Audit Trail**
   - Keep all edit records (approved/rejected) for compliance
   - Track who approved/rejected and when

---

## Performance Considerations

1. **Database Indexes**
   - Index on listing_edits(listing_id, status) for fast lookups
   - Index on listing_edits(created_at) for sorting
   - Index on listing_edit_media(listing_edit_id) for joins

2. **Image Storage**
   - Store pending images in separate folder/path
   - Cleanup rejected images immediately
   - Move approved images to main storage

3. **Caching**
   - Cache pending edit count for admin dashboard
   - Cache user's pending edit status for listing views

---

## Future Enhancements (Not in Scope)

1. Auto-approve edits from trusted users (high reputation score)
2. Partial approval (approve some fields, reject others)
3. Edit suggestions from admins (instead of just reject)
4. Bulk approve/reject for admins
5. Edit expiry after X days of inactivity
6. Email notifications to admins on edit submission
7. Edit frequency limits per user tier

---

## Summary

This system provides a robust solution for editing approved listings while maintaining content quality through admin review. The two-tier approach ensures safe fields update instantly for better UX, while sensitive fields go through approval to prevent abuse. The original listing remains visible throughout the review process, ensuring no disruption to potential buyers.

**Key Benefits:**
- ✅ Original listing always visible during review
- ✅ Instant updates for safe fields (better UX)
- ✅ Admin control over sensitive content
- ✅ Complete audit trail
- ✅ Flexible image management
- ✅ No impact on existing listings table structure
- ✅ Clean separation of concerns

**Implementation Timeline:** Next Month

---

**Document Version:** 1.0  
**Last Updated:** December 28, 2025  
**Status:** Ready for Implementation
