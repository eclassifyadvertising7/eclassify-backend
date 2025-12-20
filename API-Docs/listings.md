# Listings API Documentation

Complete API documentation for listing management endpoints.

## Important Notes

- **Favorite Counts**: All listing responses automatically include a `favoriteCount` field showing the total number of users who have favorited that listing.
- **Authentication**: End-user endpoints require user authentication. Panel endpoints require admin/staff roles.

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **End-User Endpoints** |
| POST | `/api/end-user/listings` | ✅ | Create listing |
| GET | `/api/end-user/listings` | ✅ | Get my listings |
| GET | `/api/end-user/listings/stats` | ✅ | Get my statistics |
| POST | `/api/end-user/listings/submit/:id` | ✅ | Submit for approval |
| PATCH | `/api/end-user/listings/sold/:id` | ✅ | Mark as sold |
| POST | `/api/end-user/listings/media/:id` | ✅ | Upload media |
| DELETE | `/api/end-user/listings/delete-media/:id/media/:mediaId` | ✅ | Delete media |
| GET | `/api/end-user/listings/:id` | ✅ | Get my listing |
| PUT | `/api/end-user/listings/:id` | ✅ | Update listing |
| DELETE | `/api/end-user/listings/:id` | ✅ | Delete listing |
| **Panel Endpoints** |
| GET | `/api/panel/listings` | ✅ Admin | Get all listings |
| GET | `/api/panel/listings/stats` | ✅ Admin | Get statistics |
| PATCH | `/api/panel/listings/approve/:id` | ✅ Admin | Approve listing |
| PATCH | `/api/panel/listings/reject/:id` | ✅ Admin | Reject listing |
| PATCH | `/api/panel/listings/featured/:id` | ✅ Admin | Update featured |
| GET | `/api/panel/listings/:id` | ✅ Admin | Get listing details |
| DELETE | `/api/panel/listings/:id` | ✅ Admin | Delete listing |
| **Public Endpoints** |
| GET | `/api/public/listings` | ❌ | Browse listings |
| GET | `/api/public/listings/featured` | ❌ | Get featured |
| POST | `/api/public/listings/view/:id` | ❌ | Increment views |
| GET | `/api/public/listings/:slug` | ❌ | Get by slug |

---

## Table of Contents

1. [End-User Endpoints](#end-user-endpoints) - User's own listings
2. [Panel Endpoints](#panel-endpoints) - Admin/staff listing management
3. [Public Endpoints](#public-endpoints) - Public listing browsing
4. [Data Models](#data-models)
5. [Complete Request/Response Examples](#complete-requestresponse-examples)
6. [Status Codes](#status-codes)

---

## End-User Endpoints

Base URL: `/api/end-user/listings`

**Authentication Required:** Yes (JWT token)

### 1. Create Listing

Create a new listing in draft status.

**Endpoint:** `POST /api/end-user/listings`

**Request Body (Car Listing):**
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

**Request Body (Property Listing):**
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
    "userId": 456,
    "categoryId": 1,
    "title": "Toyota Camry 2020 - Excellent Condition",
    "slug": "toyota-camry-2020-excellent-condition-abc123",
    "description": "Well maintained Toyota Camry...",
    "price": "1500000.00",
    "priceNegotiable": true,
    "status": "draft",
    "postedByType": "owner",
    "stateId": 1,
    "cityId": 5,
    "locality": "Andheri West",
    "isFeatured": false,
    "viewCount": 0,
    "contactCount": 0,
    "createdAt": "2024-11-23T10:30:00.000Z",
    "updatedAt": "2024-11-23T10:30:00.000Z",
    "carListing": {
      "id": 78,
      "listingId": 123,
      "brandId": 10,
      "modelId": 45,
      "year": 2020,
      "condition": "used",
      "mileageKm": 25000,
      "fuelType": "petrol",
      "transmission": "automatic"
    },
    "media": []
  }
}
```

---

### 2. Get My Listings

Get all listings created by the authenticated user.

**Endpoint:** `GET /api/end-user/listings`

**Query Parameters:**
- `status` (optional) - Filter by status: draft, pending, active, expired, sold, rejected
- `categoryId` (optional) - Filter by category ID
- `search` (optional) - Search in title and description
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page

**Example:** `GET /api/end-user/listings?status=active&page=1&limit=10`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "Toyota Camry 2020",
      "slug": "toyota-camry-2020-abc123",
      "price": "1500000.00",
      "status": "active",
      "postedByType": "owner",
      "isFeatured": false,
      "viewCount": 45,
      "createdAt": "2024-11-23T10:30:00.000Z",
      "user": {
        "id": 456,
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 1,
        "name": "Maharashtra"
      },
      "city": {
        "id": 5,
        "name": "Mumbai"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "thumbnailUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "mediaType": "image",
          "isPrimary": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 3. Get My Listing by ID

Get detailed information about a specific listing.

**Endpoint:** `GET /api/end-user/listings/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing retrieved successfully",
  "data": {
    "id": 123,
    "userId": 456,
    "categoryId": 1,
    "title": "Toyota Camry 2020",
    "slug": "toyota-camry-2020-abc123",
    "description": "Well maintained...",
    "price": "1500000.00",
    "status": "active",
    "approvedAt": "2024-11-23T12:00:00.000Z",
    "expiresAt": "2024-12-23T12:00:00.000Z",
    "carListing": { /* car details */ },
    "media": [ /* media array */ ]
  }
}
```

---

### 4. Update My Listing

Update listing details (only allowed for draft or rejected listings).

**Endpoint:** `PUT /api/end-user/listings/:id`

**Request Body (Update Base Fields):**
```json
{
  "title": "Updated Toyota Camry 2020 - Excellent Condition",
  "description": "Updated description with more details...",
  "price": 1450000,
  "priceNegotiable": false,
  "stateId": 1,
  "cityId": 5,
  "locality": "Updated Locality",
  "address": "Updated Address"
}
```

**Request Body (Update Car Listing):**
```json
{
  "title": "Updated Title",
  "price": 1450000,
  "categoryType": "car",
  "carData": "{\"mileageKm\": 26000, \"color\": \"Silver\", \"ownersCount\": 2}"
}
```

**Request Body (Update Property Listing):**
```json
{
  "title": "Updated Property Title",
  "price": 8000000,
  "categoryType": "property",
  "propertyData": "{\"furnished\": \"fully-furnished\", \"parkingSpaces\": 2}"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "data": { /* updated listing */ }
}
```

---

### 5. Submit Listing for Approval

Submit a draft or rejected listing for admin approval.

**Endpoint:** `POST /api/end-user/listings/submit/:id`

**Request Body:**
```json
{
  "status": "pending"
}
```

**Note:** Status must be explicitly set to "pending" to submit for approval.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing submitted for approval",
  "data": {
    "id": 123,
    "status": "pending"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "At least one image is required to submit listing"
}
```

---

### 6. Mark Listing as Sold

Mark an active listing as sold.

**Endpoint:** `PATCH /api/end-user/listings/sold/:id`

**Request Body:**
```json
{
  "status": "sold"
}
```

**Note:** Status must be explicitly set to "sold" to mark listing as sold.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing marked as sold",
  "data": {
    "id": 123,
    "status": "sold"
  }
}
```

---

### 7. Upload Media

Upload images and/or videos for a listing (max 15 images + 3 videos).

**Endpoint:** `POST /api/end-user/listings/media/:id`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `media` - Array of image/video files
  - Images: max 15, 5MB each (JPEG, PNG, WebP)
  - Videos: max 3, 50MB each (MP4, MOV, AVI)

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
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front-abc123.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front-abc123.jpg",
      "displayOrder": 0,
      "isPrimary": true
    },
    {
      "id": 2,
      "listingId": 123,
      "mediaType": "video",
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/videos/car-tour-xyz789.mp4",
      "thumbnailUrl": null,
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
      "mediaUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front-abc123.jpg",
      "thumbnailUrl": "http://localhost:5000/uploads/listings/user-456/images/car-front-abc123.jpg",
      "displayOrder": 0,
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

### 8. Delete Media

Delete a specific media from listing.

**Endpoint:** `DELETE /api/end-user/listings/delete-media/:id/media/:mediaId`

**URL Parameters:**
- `id` - Listing ID
- `mediaId` - Media ID to delete

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "data": null
}
```

---

### 9. Delete My Listing

Soft delete a listing.

**Endpoint:** `DELETE /api/end-user/listings/:id`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing deleted successfully",
  "data": null
}
```

---

### 10. Get My Statistics

Get listing statistics for the authenticated user.

**Endpoint:** `GET /api/end-user/listings/stats`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 25,
    "draft": 3,
    "pending": 2,
    "active": 15,
    "expired": 3,
    "sold": 1,
    "rejected": 1
  }
}
```

---

## Panel Endpoints

Base URL: `/api/panel/listings`

**Authentication Required:** Yes (Admin/Staff roles)

### 1. Get All Listings

Get all listings with filters (admin view).

**Endpoint:** `GET /api/panel/listings`

**Query Parameters:**
- `status` - Filter by status
- `categoryId` - Filter by category
- `stateId` - Filter by state
- `cityId` - Filter by city
- `userId` - Filter by user
- `isFeatured` - Filter featured listings
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search query
- `sortBy` - Sort order: price_asc, price_desc
- `page` - Page number
- `limit` - Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "Toyota Camry 2020",
      "slug": "toyota-camry-2020-abc123",
      "price": "1500000.00",
      "status": "pending",
      "postedByType": "owner",
      "isFeatured": false,
      "viewCount": 12,
      "createdAt": "2024-11-23T10:30:00.000Z",
      "user": {
        "id": 456,
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 1,
        "name": "Maharashtra"
      },
      "city": {
        "id": 5,
        "name": "Mumbai"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "thumbnailUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "mediaType": "image",
          "isPrimary": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 2. Get Listing Statistics

Get overall listing statistics.

**Endpoint:** `GET /api/panel/listings/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 1250,
    "draft": 45,
    "pending": 23,
    "active": 980,
    "expired": 150,
    "sold": 42,
    "rejected": 10
  }
}
```

---

### 3. Get Listing by ID

Get detailed listing information (admin view).

**Endpoint:** `GET /api/panel/listings/:id`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing retrieved successfully",
  "data": {
    "id": 123,
    "user": {
      "id": 456,
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-456/photo.jpg"
      }
    },
    /* full listing details */
  }
}
```

---

### 4. Approve Listing

Approve a pending listing.

**Endpoint:** `PATCH /api/panel/listings/approve/:id`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing approved successfully",
  "data": {
    "id": 123,
    "status": "active",
    "approvedAt": "2024-11-23T12:00:00.000Z",
    "approvedBy": 789,
    "publishedAt": "2024-11-23T12:00:00.000Z",
    "expiresAt": "2024-12-23T12:00:00.000Z"
  }
}
```

---

### 5. Reject Listing

Reject a pending listing with reason.

**Endpoint:** `PATCH /api/panel/listings/reject/:id`

**Request Body:**
```json
{
  "reason": "Images are not clear. Please upload better quality images."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing rejected successfully",
  "data": {
    "id": 123,
    "status": "rejected",
    "rejectedAt": "2024-11-23T12:00:00.000Z",
    "rejectedBy": 789,
    "rejectionReason": "Images are not clear..."
  }
}
```

---

### 6. Update Featured Status

Set or remove featured status for a listing.

**Endpoint:** `PATCH /api/panel/listings/featured/:id`

**Request Body:**
```json
{
  "isFeatured": true,
  "days": 7
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing featured successfully",
  "data": {
    "id": 123,
    "isFeatured": true,
    "featuredUntil": "2024-11-30T12:00:00.000Z"
  }
}
```

---

### 7. Delete Listing

Soft delete a listing (admin).

**Endpoint:** `DELETE /api/panel/listings/:id`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing deleted successfully",
  "data": null
}
```

---

## Public Endpoints

Base URL: `/api/public/listings`

**Authentication Required:** No

### 1. Browse Listings

Browse all active listings.

**Endpoint:** `GET /api/public/listings`

**Query Parameters:**
- `categoryId` - Filter by category
- `stateId` - Filter by state
- `cityId` - Filter by city
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search query
- `sortBy` - Sort order
- `page` - Page number
- `limit` - Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "Toyota Camry 2020",
      "slug": "toyota-camry-2020-abc123",
      "price": "1500000.00",
      "status": "active",
      "postedByType": "owner",
      "isFeatured": false,
      "viewCount": 45,
      "createdAt": "2024-11-23T10:30:00.000Z",
      "user": {
        "id": 456,
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 1,
        "name": "Maharashtra"
      },
      "city": {
        "id": 5,
        "name": "Mumbai"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "thumbnailUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "mediaType": "image",
          "isPrimary": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 980,
    "page": 1,
    "limit": 20,
    "totalPages": 49
  }
}
```

---

### 2. Get Featured Listings

Get featured listings only.

**Endpoint:** `GET /api/public/listings/featured`

**Query Parameters:**
- `categoryId` - Filter by category
- `limit` (default: 10) - Number of listings

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [
    {
      "id": 123,
      "title": "Toyota Camry 2020",
      "slug": "toyota-camry-2020-abc123",
      "price": "1500000.00",
      "status": "active",
      "postedByType": "owner",
      "isFeatured": true,
      "featuredUntil": "2024-11-30T12:00:00.000Z",
      "viewCount": 120,
      "createdAt": "2024-11-23T10:30:00.000Z",
      "user": {
        "id": 456,
        "fullName": "John Doe",
        "mobile": "9876543210"
      },
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 1,
        "name": "Maharashtra"
      },
      "city": {
        "id": 5,
        "name": "Mumbai"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "thumbnailUrl": "http://localhost:5000/uploads/listings/2024/11/image1.jpg",
          "mediaType": "image",
          "isPrimary": true
        }
      ]
    }
  ]
}
```

---

### 3. Get Listing by Slug

Get detailed listing information by slug.

**Endpoint:** `GET /api/public/listings/:slug`

**Example:** `GET /api/public/listings/toyota-camry-2020-abc123`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing retrieved successfully",
  "data": {
    "id": 123,
    "title": "Toyota Camry 2020",
    "slug": "toyota-camry-2020-abc123",
    "description": "Well maintained...",
    "price": "1500000.00",
    "status": "active",
    "postedByType": "owner",
    "viewCount": 45,
    "carListing": { /* car details */ },
    "media": [ /* media array */ ],
    "user": {
      "id": 456,
      "fullName": "John Doe",
      "profile": {
        "profilePhoto": "https://res.cloudinary.com/your-cloud/image/upload/eclassify_app/uploads/profiles/user-456/photo.jpg"
      }
    }
  }
}
```

---

### 4. Increment View Count

Track listing views.

**Endpoint:** `POST /api/public/listings/view/:id`

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "View count updated",
  "data": null
}
```

---

## Data Models

### Listing Status Flow

```
draft → pending → active → expired/sold
                ↓
            rejected
```

### Status Descriptions

- **draft** - User created, not submitted
- **pending** - Submitted, awaiting approval
- **active** - Approved and live
- **expired** - Auto-expired after 30 days
- **sold** - Marked as sold by user
- **rejected** - Rejected by admin

### Car Listing ENUMs

**Condition:**
- `new`
- `used`

**Fuel Type:**
- `petrol`
- `diesel`
- `cng`
- `lpg`
- `electric`
- `hybrid`

**Transmission:**
- `manual`
- `automatic`
- `cvt`
- `semi-automatic`

**Body Type:**
- `sedan`
- `hatchback`
- `suv`
- `coupe`
- `convertible`
- `wagon`
- `pickup`
- `van`
- `truck`

### Property Listing ENUMs

**Property Type:**
- `apartment`
- `house`
- `villa`
- `plot`
- `commercial`
- `office`
- `shop`
- `warehouse`

**Listing Type:**
- `sale`
- `rent`
- `pg`
- `hostel`

**Furnished:**
- `unfurnished`
- `semi-furnished`
- `fully-furnished`

**Facing:**
- `north`
- `south`
- `east`
- `west`
- `north-east`
- `north-west`
- `south-east`
- `south-west`

---

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

---

## Notes

1. **Authentication:** All end-user and panel endpoints require JWT token in Authorization header: `Bearer <token>`
2. **Media Limits:** 
   - Images: Max 15 per listing, 5MB each (JPEG, PNG, WebP)
   - Videos: Max 3 per listing, 50MB each (MP4, MOV, AVI)
3. **Media Storage:** Files stored in `uploads/listings/user-{userId}/{images|videos}/`
4. **Auto-Expiration:** Active listings expire after 30 days
5. **Slug Generation:** Automatically generated from title on creation
6. **Primary Media:** First uploaded media is automatically set as primary
7. **Soft Delete:** Deleted listings are soft-deleted and can be recovered
8. **Video Processing:** Video thumbnail generation not yet implemented (requires ffmpeg)

---

## Complete Request/Response Examples

### Example 1: Create Car Listing

**Request:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "categoryType": "car",
    "title": "Toyota Camry 2020 - Excellent Condition",
    "description": "Well maintained Toyota Camry with full service history. Single owner, all services done at authorized service center. Non-accidental, excellent condition.",
    "price": 1500000,
    "priceNegotiable": true,
    "stateId": 1,
    "cityId": 5,
    "locality": "Andheri West",
    "address": "Near Metro Station, Andheri West",
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
    "features": ["ABS", "Airbags", "Sunroof", "Leather Seats", "Parking Sensors"]
  }'
```

---

### Example 2: Create Property Listing

**Request:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 2,
    "categoryType": "property",
    "title": "Spacious 3BHK Apartment in Prime Location",
    "description": "Beautiful 3BHK apartment with modern amenities in a prime location. Well-maintained society with 24/7 security, gym, swimming pool, and children play area.",
    "price": 8500000,
    "priceNegotiable": true,
    "stateId": 1,
    "cityId": 5,
    "locality": "Bandra West",
    "address": "Near Linking Road, Bandra West",
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
    "amenities": ["gym", "pool", "security", "lift", "power-backup"],
    "ownershipType": "freehold",
    "reraApproved": true,
    "reraId": "P51800012345"
  }'
```

---

### Example 3: Upload Media (Images and Videos)

**Request:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings/media/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@/path/to/car-front.jpg" \
  -F "media=@/path/to/car-side.jpg" \
  -F "media=@/path/to/car-interior.jpg" \
  -F "media=@/path/to/car-tour.mp4"
```

---

### Example 4: Submit for Approval

**Request:**
```bash
curl -X POST http://localhost:5000/api/end-user/listings/submit/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'
```

---

### Example 5: Update Listing

**Request:**
```bash
curl -X PUT http://localhost:5000/api/end-user/listings/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Toyota Camry 2020 - Price Reduced",
    "price": 1450000,
    "description": "Updated description with price reduction...",
    "priceNegotiable": true
  }'
```

---

### Example 6: Approve Listing (Admin)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/panel/listings/approve/123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### Example 7: Reject Listing (Admin)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/panel/listings/reject/123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Images are not clear. Please upload better quality images showing all angles of the vehicle."
  }'
```

---

### Example 8: Update Featured Status (Admin)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/panel/listings/featured/123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isFeatured": true,
    "days": 7
  }'
```

---

### Example 9: Browse Public Listings

**Request:**
```bash
curl "http://localhost:5000/api/public/listings?categoryId=1&stateId=1&cityId=5&minPrice=1000000&maxPrice=2000000&page=1&limit=10"
```

---

### Example 10: Get Listing by Slug

**Request:**
```bash
curl "http://localhost:5000/api/public/listings/toyota-camry-2020-abc123"
```

---

### Example 11: Mark as Sold

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/end-user/listings/sold/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "sold"}'
```

---

### Example 12: Delete Media

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/end-user/listings/delete-media/123/media/456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Example 13: Get My Statistics

**Request:**
```bash
curl http://localhost:5000/api/end-user/listings/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Example 14: Search with Filters

**Request:**
```bash
# Search cars by brand, fuel type, and price range
curl "http://localhost:5000/api/public/listings?categoryId=1&minPrice=1000000&maxPrice=2000000&sortBy=price_asc&page=1&limit=20"

# Search properties by type and bedrooms
curl "http://localhost:5000/api/public/listings?categoryId=2&search=apartment&minPrice=5000000&maxPrice=10000000"
```

---

**Last Updated:** November 23, 2024
