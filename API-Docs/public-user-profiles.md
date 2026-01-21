# Public User Profiles API Documentation

## Overview

Public endpoints for viewing user profiles and their listings. These endpoints allow any user to view another user's public profile information and browse their listings by category.

## Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/public/users/profile/:userId`

**Description**: Retrieve a user's public profile with category-wise listing statistics and recent listings.

**Parameters**:
- `userId` (path, required): User ID to fetch profile for
- `listingsPerCategory` (query, optional): Number of recent listings per category (default: 3, max: 10)

**Request Example**:
```
GET /api/public/users/profile/123?listingsPerCategory=5
```

**Response Example**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "joinedDate": "2024-01-15T10:30:00Z",
      "isVerified": true,
      "totalListings": 45
    },
    "categoryStats": [
      {
        "categoryId": 1,
        "categoryName": "Cars",
        "categorySlug": "cars",
        "active": 15,
        "sold": 8,
        "expired": 2,
        "total": 25,
        "recentListings": [
          {
            "id": "101",
            "userId": "123",
            "categoryId": 1,
            "categorySlug": "cars",
            "title": "I want to sell 2020 Toyota Camry LE PETROL AUTOMATIC",
            "slug": "i-want-to-sell-2020-toyota-camry-le-petrol-automatic-abc1",
            "shareCode": "TOYCAR1",
            "description": "Selling my well-maintained 2020 Toyota Camry LE in excellent condition...",
            "price": "25000.00",
            "priceNegotiable": true,
            "stateId": 36,
            "cityId": 1234,
            "stateName": "New York",
            "cityName": "New York City",
            "locality": "Manhattan, Downtown",
            "pincode": "10001",
            "latitude": "40.75058333",
            "longitude": "-73.99619444",
            "status": "active",
            "isFeatured": false,
            "featuredUntil": null,
            "expiresAt": "2024-02-20T10:30:00.000Z",
            "publishedAt": "2024-01-20T10:30:00.000Z",
            "approvedAt": "2024-01-20T10:30:00.000Z",
            "viewCount": 45,
            "contactCount": 12,
            "totalFavorites": 8,
            "coverImage": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-123/images/20251231151230-toyota-camry-7hl.jpg?_a=BAMAMiZW0",
            "coverImageStorageType": "cloudinary",
            "coverImageMimeType": "image/jpeg",
            "postedByType": "owner",
            "isPaidListing": false,
            "keywords": "Toyota, Camry, LE, Manhattan, Downtown, New York City, 2020, petrol, automatic, Silver, 25000, 15000km, 1 owner, NYC, used car",
            "essentialData": {
              "year": 2020,
              "fuelType": "petrol",
              "brandName": "Toyota",
              "mileageKm": 15000,
              "modelName": "Camry",
              "variantName": "LE"
            },
            "created_at": "2024-01-20T10:30:00.000Z",
            "updated_at": "2024-01-20T10:30:00.000Z"
          },
          {
            "id": "102",
            "userId": "123",
            "categoryId": 1,
            "categorySlug": "cars",
            "title": "2019 Honda Civic EX PETROL MANUAL",
            "slug": "2019-honda-civic-ex-petrol-manual-def2",
            "shareCode": "HONCIV2",
            "description": "Honda Civic 2019 in great condition, well maintained...",
            "price": "22000.00",
            "priceNegotiable": false,
            "stateId": 36,
            "cityId": 1234,
            "stateName": "New York",
            "cityName": "New York City",
            "locality": "Brooklyn, Bay Ridge",
            "pincode": "11209",
            "latitude": "40.62558333",
            "longitude": "-74.03019444",
            "status": "sold",
            "isFeatured": false,
            "featuredUntil": null,
            "expiresAt": "2024-02-18T14:20:00.000Z",
            "publishedAt": "2024-01-18T14:20:00.000Z",
            "approvedAt": "2024-01-18T14:20:00.000Z",
            "viewCount": 78,
            "contactCount": 23,
            "totalFavorites": 15,
            "coverImage": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-123/images/20251231151230-honda-civic-8kl.jpg?_a=BAMAMiZW0",
            "coverImageStorageType": "cloudinary",
            "coverImageMimeType": "image/jpeg",
            "postedByType": "owner",
            "isPaidListing": false,
            "keywords": "Honda, Civic, EX, Brooklyn, Bay Ridge, New York City, 2019, petrol, manual, Blue, 22000, 25000km, 1 owner, NYC, used car",
            "essentialData": {
              "year": 2019,
              "fuelType": "petrol",
              "brandName": "Honda",
              "mileageKm": 25000,
              "modelName": "Civic",
              "variantName": "EX"
            },
            "created_at": "2024-01-18T14:20:00.000Z",
            "updated_at": "2024-01-18T14:20:00.000Z"
          }
        ]
      },
      {
        "categoryId": 2,
        "categoryName": "Properties",
        "categorySlug": "properties",
        "active": 12,
        "sold": 5,
        "expired": 3,
        "total": 20,
        "recentListings": [
          {
            "id": "201",
            "userId": "123",
            "categoryId": 2,
            "categorySlug": "properties",
            "title": "3BHK Apartment for Sale in Downtown Manhattan",
            "slug": "3bhk-apartment-for-sale-in-downtown-manhattan-xyz3",
            "shareCode": "APTMNH3",
            "description": "Spacious 3BHK apartment available for sale in Downtown Manhattan. This apartment has 1200 sqft area with 2 bathroom(s) and 2 balconies...",
            "price": "450000.00",
            "priceNegotiable": true,
            "stateId": 36,
            "cityId": 1234,
            "stateName": "New York",
            "cityName": "New York City",
            "locality": "Manhattan, Downtown",
            "pincode": "10001",
            "latitude": "40.75058333",
            "longitude": "-73.99619444",
            "status": "active",
            "isFeatured": true,
            "featuredUntil": "2024-02-19T09:15:00.000Z",
            "expiresAt": "2024-03-19T09:15:00.000Z",
            "publishedAt": "2024-01-19T09:15:00.000Z",
            "approvedAt": "2024-01-19T09:15:00.000Z",
            "viewCount": 156,
            "contactCount": 34,
            "totalFavorites": 28,
            "coverImage": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-123/images/20260104130046-apartment-zr8.jpg?_a=BAMAMiZW0",
            "coverImageStorageType": "cloudinary",
            "coverImageMimeType": "image/jpeg",
            "postedByType": "owner",
            "isPaidListing": true,
            "keywords": "apartment, Manhattan, Downtown, New York City, New York, 1200 sqft, Rs 450000, 3bhk, furnished",
            "essentialData": {
              "areaSqft": 1200,
              "unitType": "3bhk",
              "listingType": "sale",
              "propertyType": "apartment"
            },
            "created_at": "2024-01-19T09:15:00.000Z",
            "updated_at": "2024-01-19T09:15:00.000Z"
          }
        ]
      }
    ]
  }
}
```

### 2. Get User Category Listings

**Endpoint**: `GET /api/public/users/:userId/listings/category/:categoryId`

**Description**: Retrieve paginated listings for a specific user and category with filtering options.

**Parameters**:
- `userId` (path, required): User ID
- `categoryId` (path, required): Category ID
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20, max: 50)
- `status` (query, optional): Filter by status - 'all', 'active', 'sold', 'expired' (default: 'all')

**Request Example**:
```
GET /api/public/users/123/listings/category/1?page=1&limit=20&status=active
```

**Response Example**:
```json
{
  "success": true,
  "message": "Category listings retrieved successfully",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe"
    },
    "category": {
      "id": 1,
      "name": "Cars",
      "slug": "cars"
    },
    "stats": {
      "active": 15,
      "sold": 8,
      "expired": 2,
      "total": 25
    },
    "listings": [
      {
        "id": "101",
        "userId": "123",
        "categoryId": 1,
        "categorySlug": "cars",
        "title": "I want to sell 2020 Toyota Camry LE PETROL AUTOMATIC",
        "slug": "i-want-to-sell-2020-toyota-camry-le-petrol-automatic-abc1",
        "shareCode": "TOYCAR1",
        "description": "Selling my well-maintained 2020 Toyota Camry LE in excellent condition. This Silver petrol automatic variant has been driven 15,000 km with 1 owner...",
        "price": "25000.00",
        "priceNegotiable": true,
        "stateId": 36,
        "cityId": 1234,
        "stateName": "New York",
        "cityName": "New York City",
        "locality": "Manhattan, Downtown",
        "pincode": "10001",
        "latitude": "40.75058333",
        "longitude": "-73.99619444",
        "status": "active",
        "isFeatured": false,
        "featuredUntil": null,
        "expiresAt": "2024-02-20T10:30:00.000Z",
        "publishedAt": "2024-01-20T10:30:00.000Z",
        "approvedAt": "2024-01-20T10:30:00.000Z",
        "viewCount": 45,
        "contactCount": 12,
        "totalFavorites": 8,
        "coverImage": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-123/images/20251231151230-toyota-camry-7hl.jpg?_a=BAMAMiZW0",
        "coverImageStorageType": "cloudinary",
        "coverImageMimeType": "image/jpeg",
        "postedByType": "owner",
        "isPaidListing": false,
        "keywords": "Toyota, Camry, LE, Manhattan, Downtown, New York City, 2020, petrol, automatic, Silver, 25000, 15000km, 1 owner, NYC, used car",
        "essentialData": {
          "year": 2020,
          "fuelType": "petrol",
          "brandName": "Toyota",
          "mileageKm": 15000,
          "modelName": "Camry",
          "variantName": "LE"
        },
        "created_at": "2024-01-20T10:30:00.000Z",
        "updated_at": "2024-01-20T10:30:00.000Z"
      },
      {
        "id": "102",
        "userId": "123",
        "categoryId": 1,
        "categorySlug": "cars",
        "title": "2019 Honda Civic EX PETROL MANUAL",
        "slug": "2019-honda-civic-ex-petrol-manual-def2",
        "shareCode": "HONCIV2",
        "description": "Honda Civic 2019 in great condition, well maintained with regular service history...",
        "price": "22000.00",
        "priceNegotiable": false,
        "stateId": 36,
        "cityId": 1234,
        "stateName": "New York",
        "cityName": "New York City",
        "locality": "Brooklyn, Bay Ridge",
        "pincode": "11209",
        "latitude": "40.62558333",
        "longitude": "-74.03019444",
        "status": "active",
        "isFeatured": false,
        "featuredUntil": null,
        "expiresAt": "2024-02-18T14:20:00.000Z",
        "publishedAt": "2024-01-18T14:20:00.000Z",
        "approvedAt": "2024-01-18T14:20:00.000Z",
        "viewCount": 78,
        "contactCount": 23,
        "totalFavorites": 15,
        "coverImage": "https://res.cloudinary.com/dgz9xfu1f/image/upload/v1/eclassify_app/uploads/listings/user-123/images/20251231151230-honda-civic-8kl.jpg?_a=BAMAMiZW0",
        "coverImageStorageType": "cloudinary",
        "coverImageMimeType": "image/jpeg",
        "postedByType": "owner",
        "isPaidListing": false,
        "keywords": "Honda, Civic, EX, Brooklyn, Bay Ridge, New York City, 2019, petrol, manual, Blue, 22000, 25000km, 1 owner, NYC, used car",
        "essentialData": {
          "year": 2019,
          "fuelType": "petrol",
          "brandName": "Honda",
          "mileageKm": 25000,
          "modelName": "Civic",
          "variantName": "EX"
        },
        "created_at": "2024-01-18T14:20:00.000Z",
        "updated_at": "2024-01-18T14:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

## Field Mapping Notes

### Core Listing Fields
- `id`: String representation of BIGINT primary key
- `userId`: String representation of BIGINT foreign key to users table
- `categoryId`: Integer foreign key to categories table
- `categorySlug`: Category identifier for frontend routing
- `title`: Listing title (max 200 characters)
- `slug`: URL-friendly unique identifier with random suffix
- `shareCode`: Unique 10-character sharing code
- `description`: Full listing description (TEXT field)
- `price`: Decimal value as string (15,2 precision)
- `priceNegotiable`: Boolean indicating if price is negotiable

### Location Fields
- `stateId`/`cityId`: Integer foreign keys to states/cities tables
- `stateName`/`cityName`: Denormalized names for performance
- `locality`: Neighborhood/area within city (replaces generic "location")
- `pincode`: Postal/ZIP code
- `latitude`/`longitude`: Decimal coordinates for mapping

### Status & Lifecycle Fields
- `status`: Enum - 'draft', 'pending', 'active', 'expired', 'sold', 'rejected'
- `isFeatured`: Boolean indicating featured status
- `featuredUntil`: Timestamp when featured status expires
- `expiresAt`: Listing expiration timestamp
- `publishedAt`: When listing went live
- `approvedAt`/`approvedBy`: Approval tracking
- `rejectedAt`/`rejectedBy`/`rejectionReason`: Rejection tracking

### Engagement Metrics
- `viewCount`: Number of times listing was viewed
- `contactCount`: Number of contact attempts
- `totalFavorites`: Number of users who favorited this listing

### Media Fields
- `coverImage`: Full URL (generated by model getter from relative path)
- `coverImageStorageType`: Storage backend - 'local', 'cloudinary', 'aws', etc.
- `coverImageMimeType`: Image MIME type for proper handling

### Business Fields
- `postedByType`: Enum - 'owner', 'agent', 'dealer'
- `isPaidListing`: Boolean indicating if listing has paid features
- `userSubscriptionId`: Link to subscription used for this listing

### Search & Discovery
- `keywords`: Comma-separated search keywords
- `essentialData`: JSONB field containing category-specific data:
  - **Cars**: `year`, `fuelType`, `brandName`, `mileageKm`, `modelName`, `variantName`
  - **Properties**: `areaSqft`, `unitType`, `listingType`, `propertyType`

### Audit Fields
- `created_at`/`updated_at`: Standard timestamps (snake_case in response)
- `createdBy`/`updatedBy`/`deletedBy`: User tracking for audit trail

### Republish Tracking
- `republishCount`: Number of times listing was republished
- `lastRepublishedAt`: Last republish timestamp
- `republishHistory`: JSONB array of republish events

## Status Definitions

- **draft**: Listing is being created but not yet submitted
- **pending**: Listing submitted and awaiting admin approval
- **active**: Listing is live, approved, and not expired
- **expired**: Listing has passed its expiration date or manually expired
- **sold**: Listing has been marked as sold by the owner
- **rejected**: Listing was rejected by admin during review

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

```json
{
  "success": false,
  "message": "User or category not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid user ID"
}
```

```json
{
  "success": false,
  "message": "Invalid status. Must be one of: all, draft, pending, active, expired, sold, rejected"
}
```

```json
{
  "success": false,
  "message": "listingsPerCategory must be between 1 and 10"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve user profile"
}
```

## Usage Notes

1. **Public Access**: These endpoints do not require authentication
2. **Privacy**: Only public user information is exposed (name, join date, verification status)
3. **Performance**: Results are optimized with proper indexing and pagination
4. **Caching**: Consider implementing caching for popular user profiles
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Query Optimization

- Categories are sorted by total listing count (descending)
- Recent listings are sorted by creation date (newest first)
- Only categories with listings are returned
- Expired listings include both manually expired and time-expired listings

## Future Enhancements

- User rating/review integration
- Social features (followers, following)
- Advanced filtering options
- User activity timeline
- Favorite listings from other users