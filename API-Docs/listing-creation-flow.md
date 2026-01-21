# Listing Creation Flow - Frontend Guide

Complete guide for implementing listing creation in the frontend application.

---

## Overview

The listing creation process uses **3 separate endpoints** to provide flexibility:

1. **CREATE** - Save listing data as draft
2. **UPLOAD MEDIA** - Add images/videos to the listing
3. **SUBMIT** - Publish the listing (with quota check and approval logic)

---

## User Actions & Flows

### Flow 1: Save as Draft

User wants to save incomplete listing for later.

```
User clicks "Save as Draft"
    ↓
1. Call CREATE endpoint
    ↓
2. If images exist, call UPLOAD MEDIA endpoint
    ↓
Done - Show success message
```

**Use Case:**
- User wants to save progress
- User doesn't have all information yet
- User wants to add images later

---

### Flow 2: Save & Submit

User wants to publish listing immediately.

```
User clicks "Save & Submit"
    ↓
1. Validate: At least 1 image required
    ↓
2. Call CREATE endpoint
    ↓
3. Call UPLOAD MEDIA endpoint
    ↓
4. Call SUBMIT endpoint
    ↓
Handle response:
  - Auto-approved → Show "Published successfully"
  - Pending → Show "Submitted for approval"
  - Quota exceeded → Show upgrade prompt
```

**Use Case:**
- User has complete information
- User has uploaded images
- User wants to publish immediately

---

### Flow 3: Edit Draft & Submit

User wants to edit existing draft and publish.

```
User opens draft listing
    ↓
User edits information
    ↓
User clicks "Submit"
    ↓
1. If changes exist, call UPDATE endpoint
    ↓
2. If new images, call UPLOAD MEDIA endpoint
    ↓
3. Validate: At least 1 image exists
    ↓
4. Call SUBMIT endpoint
    ↓
Handle response (same as Flow 2)
```

**Use Case:**
- User has saved draft earlier
- User completes missing information
- User adds required images

---

## API Endpoints Reference

### 1. CREATE Listing

**Endpoint:** `POST /api/end-user/listings`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (Car):**
```json
{
  "categoryId": 1,
  "categoryType": "car",
  "title": "Toyota Camry 2020 - Excellent Condition",
  "description": "Well maintained Toyota Camry with full service history...",
  "price": 1500000,
  "priceNegotiable": true,
  "stateId": 1,
  "cityId": 5,
  "locality": "Andheri West",
  "address": "Near Metro Station",
  "latitude": 19.1234,
  "longitude": 72.5678,
  "brandId": 10,
  "modelId": 45,
  "variantId": 120,
  "year": 2020,
  "registrationYear": 2020,
  "condition": "used",
  "mileageKm": 25000,
  "ownersCount": 1,
  "fuelType": "petrol",
  "transmission": "automatic",
  "bodyType": "sedan",
  "color": "White",
  "engineCapacityCc": 2500,
  "powerBhp": 180,
  "seats": 5,
  "registrationNumber": "MH01AB1234",
  "registrationStateId": 1,
  "features": ["ABS", "Airbags", "Sunroof", "Leather Seats"]
}
```

**Request Body (Property):**
```json
{
  "categoryId": 2,
  "categoryType": "property",
  "title": "Spacious 3BHK Apartment in Prime Location",
  "description": "Beautiful 3BHK apartment with modern amenities...",
  "price": 8500000,
  "priceNegotiable": true,
  "stateId": 1,
  "cityId": 5,
  "locality": "Bandra West",
  "address": "Near Linking Road",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "propertyType": "apartment",
  "listingType": "sale",
  "bedrooms": 3,
  "bathrooms": 2,
  "balconies": 2,
  "areaSqft": 1200,
  "carpetAreaSqft": 1000,
  "floorNumber": 5,
  "totalFloors": 10,
  "ageYears": 3,
  "facing": "north",
  "furnished": "semi-furnished",
  "parkingSpaces": 1,
  "amenities": ["gym", "pool", "security", "lift"],
  "ownershipType": "freehold",
  "reraApproved": true,
  "reraId": "P51800012345"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "id": 123,
    "status": "draft",
    "title": "Toyota Camry 2020 - Excellent Condition",
    "slug": "toyota-camry-2020-excellent-condition-abc123",
    "price": "1500000.00",
    "categoryId": 1,
    "userId": 456,
    "createdAt": "2024-11-23T10:30:00.000Z"
  }
}
```

**Key Points:**
- ✅ Always creates with `status: "draft"`
- ✅ No quota check at this stage
- ✅ Returns listing ID for next steps
- ✅ Fast response (no complex logic)

---

### 2. UPLOAD MEDIA

**Endpoint:** `POST /api/end-user/listings/media/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**
```
media: [File, File, File, ...]
```

**Limits:**
- Images: Max 15, 5MB each (JPEG, PNG, WebP)
- Videos: Max 3, 50MB each (MP4, MOV, AVI)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": [
    {
      "id": 1,
      "listingId": 123,
      "mediaType": "image",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front.jpg",
      "displayOrder": 0,
      "isPrimary": true
    },
    {
      "id": 2,
      "listingId": 123,
      "mediaType": "image",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/car-interior.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/car-interior.jpg",
      "displayOrder": 1,
      "isPrimary": false
    }
  ]
}
```

**Response (207 Multi-Status) - Partial Success:**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": [
    {
      "id": 1,
      "listingId": 123,
      "mediaType": "image",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front.jpg",
      "displayOrder": 0,
      "isPrimary": true
    }
  ],
  "errors": [
    {
      "file": "large-image.jpg",
      "error": "File size exceeds maximum limit"
    }
  ]
}
```

**Key Points:**
- ✅ Can be called multiple times
- ✅ First image automatically set as primary
- ✅ Returns 207 if some files fail
- ✅ Supports both images and videos

---

### 3. SUBMIT Listing

**Endpoint:** `POST /api/end-user/listings/submit/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "pending"
}
```

**Response 1 - Auto-Approved (200 OK):**
```json
{
  "success": true,
  "message": "Listing submitted and auto-approved successfully",
  "data": {
    "id": 123,
    "status": "active",
    "isAutoApproved": true,
    "approvedAt": "2024-11-23T12:00:00.000Z",
    "publishedAt": "2024-11-23T12:00:00.000Z",
    "expiresAt": "2024-12-23T12:00:00.000Z"
  },
  "quotaExceeded": false
}
```

**Response 2 - Pending Approval (200 OK):**
```json
{
  "success": true,
  "message": "Listing submitted for approval",
  "data": {
    "id": 123,
    "status": "pending"
  },
  "quotaExceeded": false
}
```

**Response 3 - Quota Exceeded (200 OK):**
```json
{
  "success": true,
  "message": "You have reached your listing limit for this category. Please upgrade your plan. Your listing has been saved as draft.",
  "data": {
    "id": 123,
    "status": "draft"
  },
  "quotaExceeded": true
}
```

**Error - No Images (400 Bad Request):**
```json
{
  "success": false,
  "message": "At least one image is required to submit listing"
}
```

**Error - Invalid Status (400 Bad Request):**
```json
{
  "success": false,
  "message": "Only draft or rejected listings can be submitted"
}
```

**Key Points:**
- ✅ Requires at least 1 image
- ✅ Checks quota eligibility
- ✅ Auto-approves if user has permission
- ✅ Returns `quotaExceeded: true` if limit reached
- ✅ Consumes quota only on success

---

## Frontend Implementation Examples

### Example 1: Save as Draft (React/JavaScript)

```javascript
async function saveDraft(listingData, images) {
  try {
    // Step 1: Create listing
    const createResponse = await fetch('/api/end-user/listings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listingData)
    });
    
    const createResult = await createResponse.json();
    
    if (!createResult.success) {
      throw new Error(createResult.message);
    }
    
    const listingId = createResult.data.id;
    
    // Step 2: Upload images if available
    if (images && images.length > 0) {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('media', image);
      });
      
      const uploadResponse = await fetch(`/api/end-user/listings/media/${listingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      
      // Handle partial success (207 status)
      if (uploadResult.errors && uploadResult.errors.length > 0) {
        console.warn('Some files failed to upload:', uploadResult.errors);
      }
    }
    
    // Success
    showNotification('success', 'Draft saved successfully');
    navigateTo(`/my-listings/${listingId}`);
    
  } catch (error) {
    showNotification('error', error.message);
  }
}
```

---

### Example 2: Save & Submit (React/JavaScript)

```javascript
async function saveAndSubmit(listingData, images) {
  try {
    // Validation
    if (!images || images.length === 0) {
      throw new Error('At least one image is required');
    }
    
    // Step 1: Create listing
    const createResponse = await fetch('/api/end-user/listings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listingData)
    });
    
    const createResult = await createResponse.json();
    
    if (!createResult.success) {
      throw new Error(createResult.message);
    }
    
    const listingId = createResult.data.id;
    
    // Step 2: Upload images
    const formData = new FormData();
    images.forEach(image => {
      formData.append('media', image);
    });
    
    const uploadResponse = await fetch(`/api/end-user/listings/media/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.success) {
      throw new Error('Failed to upload images');
    }
    
    // Step 3: Submit for approval
    const submitResponse = await fetch(`/api/end-user/listings/submit/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'pending' })
    });
    
    const submitResult = await submitResponse.json();
    
    // Handle different outcomes
    if (submitResult.quotaExceeded) {
      // Show upgrade prompt
      showQuotaExceededModal({
        message: submitResult.message,
        listingId: listingId
      });
    } else if (submitResult.data.status === 'active') {
      // Auto-approved
      showNotification('success', 'Listing published successfully!');
      navigateTo(`/listings/${submitResult.data.id}`);
    } else if (submitResult.data.status === 'pending') {
      // Pending approval
      showNotification('info', 'Listing submitted for approval');
      navigateTo('/my-listings');
    }
    
  } catch (error) {
    showNotification('error', error.message);
  }
}
```

---

### Example 3: Edit Draft & Submit (React/JavaScript)

```javascript
async function editAndSubmit(listingId, updates, newImages, existingImagesCount) {
  try {
    // Step 1: Update listing if changes exist
    if (updates && Object.keys(updates).length > 0) {
      const updateResponse = await fetch(`/api/end-user/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      const updateResult = await updateResponse.json();
      
      if (!updateResult.success) {
        throw new Error(updateResult.message);
      }
    }
    
    // Step 2: Upload new images if any
    if (newImages && newImages.length > 0) {
      const formData = new FormData();
      newImages.forEach(image => {
        formData.append('media', image);
      });
      
      const uploadResponse = await fetch(`/api/end-user/listings/media/${listingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload images');
      }
      
      existingImagesCount += uploadResult.data.length;
    }
    
    // Step 3: Validate at least 1 image exists
    if (existingImagesCount === 0) {
      throw new Error('At least one image is required to submit listing');
    }
    
    // Step 4: Submit for approval
    const submitResponse = await fetch(`/api/end-user/listings/submit/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'pending' })
    });
    
    const submitResult = await submitResponse.json();
    
    // Handle response (same as saveAndSubmit)
    if (submitResult.quotaExceeded) {
      showQuotaExceededModal({
        message: submitResult.message,
        listingId: listingId
      });
    } else if (submitResult.data.status === 'active') {
      showNotification('success', 'Listing published successfully!');
      navigateTo(`/listings/${submitResult.data.id}`);
    } else if (submitResult.data.status === 'pending') {
      showNotification('info', 'Listing submitted for approval');
      navigateTo('/my-listings');
    }
    
  } catch (error) {
    showNotification('error', error.message);
  }
}
```

---

## UI/UX Recommendations

### Button States

**Save as Draft Button:**
- Always enabled (even without images)
- Label: "Save as Draft"
- Action: Call CREATE + UPLOAD MEDIA (if images exist)

**Save & Submit Button:**
- Disabled if no images uploaded
- Label: "Save & Submit" or "Publish"
- Action: Call CREATE + UPLOAD MEDIA + SUBMIT

**Submit Button (for existing drafts):**
- Disabled if no images exist
- Label: "Submit for Approval" or "Publish"
- Action: Call UPDATE (if changes) + UPLOAD MEDIA (if new images) + SUBMIT

---

### Loading States

```javascript
// Show different loading messages
setLoading(true);
setLoadingMessage('Creating listing...');

// After create
setLoadingMessage('Uploading images...');

// After upload
setLoadingMessage('Submitting for approval...');

// Done
setLoading(false);
```

---

### Error Handling

```javascript
// Handle specific errors
if (error.message.includes('At least one image')) {
  showError('Please upload at least one image before submitting');
} else if (error.message.includes('quota')) {
  showQuotaExceededModal();
} else {
  showError(error.message);
}
```

---

### Quota Exceeded Modal

```javascript
function showQuotaExceededModal({ message, listingId }) {
  // Show modal with:
  // - Error message
  // - Current plan details
  // - "Upgrade Plan" button
  // - "Keep as Draft" button
  
  Modal.show({
    title: 'Listing Limit Reached',
    message: message,
    actions: [
      {
        label: 'Upgrade Plan',
        onClick: () => navigateTo('/subscription/plans')
      },
      {
        label: 'Keep as Draft',
        onClick: () => navigateTo(`/my-listings/${listingId}`)
      }
    ]
  });
}
```

---

## Additional Endpoints

### Get My Listings

**Endpoint:** `GET /api/end-user/listings?status=draft`

Use to show user's draft listings.

### Update Listing

**Endpoint:** `PUT /api/end-user/listings/:id`

Use to update draft or rejected listings before submitting.

### Delete Media

**Endpoint:** `DELETE /api/end-user/listings/delete-media/:id/media/:mediaId`

Use to remove unwanted images before submitting.

---

## Testing Checklist

- [ ] Create listing without images → saves as draft
- [ ] Create listing with images → saves as draft with media
- [ ] Submit listing without images → shows error
- [ ] Submit listing with images (auto-approve) → becomes active
- [ ] Submit listing with images (no auto-approve) → becomes pending
- [ ] Submit listing when quota exceeded → stays draft, shows upgrade prompt
- [ ] Edit draft and submit → updates and submits correctly
- [ ] Upload multiple images → all uploaded successfully
- [ ] Upload oversized image → shows error for that file only
- [ ] Delete image from draft → removes successfully

---

## Common Issues & Solutions

### Issue 1: "At least one image is required"
**Cause:** Trying to submit without uploading images
**Solution:** Disable submit button until at least 1 image is uploaded

### Issue 2: Quota exceeded after creating draft
**Cause:** User's quota was exhausted between create and submit
**Solution:** Show upgrade modal, keep listing as draft

### Issue 3: Some images fail to upload
**Cause:** File size or format issues
**Solution:** Check for 207 status, show which files failed, allow retry

### Issue 4: Listing stuck in draft
**Cause:** User didn't complete the submit step
**Solution:** Show "Complete Submission" prompt on draft listings

---

## Summary

**3-Step Process:**
1. **CREATE** → Always draft, fast, no quota check
2. **UPLOAD MEDIA** → Add images/videos, can be called multiple times
3. **SUBMIT** → Quota check, auto-approve logic, publish

**Key Benefits:**
- Flexible workflow (save progress anytime)
- No wasted quota on incomplete listings
- Clear separation of concerns
- Better error handling
- Improved user experience
