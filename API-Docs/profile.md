# Profile API Documentation

## Overview
Profile management endpoints for all authenticated users (end-users and admins) to manage personal information, business/KYC details, and profile photos.

**Base Path:** `/api/profile`

---

## Endpoints

### 1. Get Current User's Profile

**GET** `/api/profile/me`

Get the current authenticated user's complete profile information.

**Authentication:** Required (JWT) - All authenticated users

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "countryCode": "+91",
    "mobile": "9175113022",
    "email": "john@example.com",
    "profilePhoto": "http://localhost:5000/uploads/profiles/profile-123-1234567890.webp",
    "status": "active",
    "isPhoneVerified": true,
    "isEmailVerified": false,
    "kycStatus": "pending",
    "subscriptionType": "free",
    "subscriptionExpiresAt": null,
    "profile": {
      "id": 45,
      "dob": "1990-01-01",
      "gender": "male",
      "about": "Software developer",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Pune",
      "stateId": 1,
      "stateName": "Maharashtra",
      "country": "India",
      "pincode": "411001",
      "latitude": "18.5204",
      "longitude": "73.8567",
      "state": {
        "id": 1,
        "name": "Maharashtra",
        "slug": "maharashtra"
      }
    },
    "role": {
      "id": 1,
      "name": "User",
      "slug": "user"
    }
  }
}
```

---

### 2. Update Current User's Profile

**PUT** `/api/profile/me`

Update current user's profile information with optional profile photo upload.

**Authentication:** Required (JWT) - All authenticated users

**Content-Type:** `multipart/form-data`

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
fullName: John Doe (optional)
email: john@example.com (optional)
dob: 1990-01-01 (optional)
gender: male (optional)
about: Software developer (optional)
addressLine1: 123 Main Street (optional)
addressLine2: Apartment 4B (optional)
city: Pune (optional)
stateId: 1 (optional)
pincode: 411001 (optional)
latitude: 18.5204 (optional)
longitude: 73.8567 (optional)
profilePhoto: <file> (optional, max 2MB, JPEG/PNG/WebP)
```

**Validation Rules:**
- `email`: Valid email format
- `profilePhoto`: Max 2MB, JPEG/PNG/WebP only
- `stateId`: Must be a valid state ID
- `latitude`: Decimal number
- `longitude`: Decimal number

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePhoto": "http://localhost:3000/uploads/profiles/profile-123-1234567890.webp",
    "profile": {
      "dob": "1990-01-01",
      "gender": "male",
      "about": "Software developer",
      "city": "Pune",
      "stateId": 1
    },
    "photoUpload": {
      "url": "http://localhost:3000/uploads/profiles/profile-123-1234567890.webp",
      "thumbnailUrl": "http://localhost:3000/uploads/profiles/profile-123-1234567890-thumb.webp",
      "publicId": "profile-123-1234567890.webp",
      "storageType": "local"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": null
}
```

---

### 3. Delete Current User's Profile Photo

**DELETE** `/api/profile/me/photo`

Delete the current user's profile photo.

**Authentication:** Required (JWT) - All authenticated users

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile photo deleted successfully",
  "data": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No profile photo to delete",
  "data": null
}
```

---

### 4. Get Current User's Business/KYC Info

**GET** `/api/profile/me/business`

Get current user's business and KYC information.

**Authentication:** Required (JWT) - All authenticated users

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "kycStatus": "pending",
    "nameOnId": "John Michael Doe",
    "businessName": "Doe Enterprises",
    "gstin": "27AABCU9603R1ZM",
    "aadharNumber": "123456789012",
    "panNumber": "ABCDE1234F"
  }
}
```

---

### 5. Update Current User's Business/KYC Info

**PUT** `/api/profile/me/business`

Update current user's business and KYC information.

**Authentication:** Required (JWT) - All authenticated users

**Content-Type:** `application/json`

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nameOnId": "John Michael Doe",
  "businessName": "Doe Enterprises",
  "gstin": "27AABCU9603R1ZM",
  "aadharNumber": "123456789012",
  "panNumber": "ABCDE1234F"
}
```

**Validation Rules:**
- `gstin`: Must be exactly 15 alphanumeric characters
- `panNumber`: Must be exactly 10 alphanumeric characters
- `aadharNumber`: Must be exactly 12 digits

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Business information updated successfully",
  "data": {
    "kycStatus": "pending",
    "nameOnId": "John Michael Doe",
    "businessName": "Doe Enterprises",
    "gstin": "27AABCU9603R1ZM",
    "aadharNumber": "123456789012",
    "panNumber": "ABCDE1234F"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "GSTIN must be 15 characters",
  "data": null
}
```

---

### 6. Get User Profile by ID (Admin Only)

**GET** `/api/profile/:userId`

Get any user's profile by their user ID. Only accessible by admins.

**Authentication:** Required (JWT) - Admin/Super Admin only

**URL Parameters:**
- `userId` (required): User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 456,
    "fullName": "Jane Smith",
    "countryCode": "+91",
    "mobile": "9876543210",
    "email": "jane@example.com",
    "profilePhoto": "http://localhost:5000/uploads/profiles/profile-456-1234567890.webp",
    "status": "active",
    "isPhoneVerified": true,
    "isEmailVerified": true,
    "kycStatus": "approved",
    "subscriptionType": "premium",
    "profile": {
      "id": 78,
      "dob": "1995-05-15",
      "gender": "female",
      "about": "Car enthusiast",
      "city": "Mumbai",
      "stateId": 1
    }
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "data": null
}
```

---

### 7. Update User Profile by ID (Admin Only)

**PUT** `/api/profile/:userId`

Update any user's profile by their user ID. Only accessible by admins.

**Authentication:** Required (JWT) - Admin/Super Admin only

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `userId` (required): User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
fullName: Jane Smith (optional)
email: jane@example.com (optional)
status: active (optional)
kycStatus: approved (optional)
profilePhoto: <file> (optional, max 2MB, JPEG/PNG/WebP)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 456,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "status": "active",
    "kycStatus": "approved"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "data": null
}
```

---

## Common Endpoints (Public)

### 8. Get All States

### 9. Get All States

**GET** `/api/common/states`

Get list of all active states.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "slug": "maharashtra",
      "name": "Maharashtra",
      "regionSlug": "western",
      "regionName": "Western"
    },
    {
      "id": 2,
      "slug": "karnataka",
      "name": "Karnataka",
      "regionSlug": "southern",
      "regionName": "Southern"
    }
  ]
}
```

---

### 10. Get Cities by State

**GET** `/api/common/cities/:stateId`

Get list of cities for a specific state.

**Authentication:** Not required

**URL Parameters:**
- `stateId` (required): State ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "slug": "pune",
      "name": "Pune",
      "stateId": 1,
      "stateName": "Maharashtra",
      "district": "Pune"
    },
    {
      "id": 2,
      "slug": "mumbai",
      "name": "Mumbai",
      "stateId": 1,
      "stateName": "Maharashtra",
      "district": "Mumbai"
    },
    {
      "id": 3,
      "slug": "satara",
      "name": "Satara",
      "stateId": 1,
      "stateName": "Maharashtra",
      "district": "Satara"
    },
    {
      "id": 4,
      "slug": "nagpur",
      "name": "Nagpur",
      "stateId": 1,
      "stateName": "Maharashtra",
      "district": "Nagpur"
    }
  ]
}
```

**Note:** Cities are currently hardcoded. Will be replaced with database query when cities table is populated.

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid state ID",
  "data": null
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found (user/resource not found) |
| 500 | Internal Server Error |

---

## Image Upload Details

### Profile Photo Specifications
- **Max Size:** 2MB
- **Allowed Formats:** JPEG, PNG, WebP
- **Max Dimensions:** 1920x1920px
- **Thumbnail Size:** 150x150px
- **Quality:** 80%
- **Output Format:** WebP (optimized)

### Storage
- **Development:** Local storage (`./uploads/profiles`)
- **Production:** Configurable (Cloudinary/S3 via `STORAGE_TYPE` env variable)

---

## Testing Examples

### Using cURL

**Get Current User's Profile:**
```bash
curl -X GET http://localhost:3000/api/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Current User's Profile with Photo:**
```bash
curl -X PUT http://localhost:3000/api/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "city=Pune" \
  -F "stateId=1" \
  -F "profilePhoto=@/path/to/photo.jpg"
```

**Get User Profile by ID (Admin):**
```bash
curl -X GET http://localhost:3000/api/profile/456 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Update User Profile by ID (Admin):**
```bash
curl -X PUT http://localhost:3000/api/profile/456 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -F "fullName=Jane Smith" \
  -F "status=active" \
  -F "kycStatus=approved"
```

**Get States:**
```bash
curl -X GET http://localhost:3000/api/common/states
```

**Get Cities:**
```bash
curl -X GET http://localhost:3000/api/common/cities/1
```

---

## Notes

1. **Profile endpoints** (`/api/profile/*`) require JWT authentication
2. **Common endpoints** (`/api/common/*`) for states/cities are public
3. **Admin-only endpoints** (`/api/profile/:userId`) require admin or super_admin role
4. Profile photo is automatically optimized and converted to WebP
5. Old profile photo is deleted when uploading a new one
6. Cities endpoint currently returns hardcoded data (Pune, Mumbai, Satara, Nagpur)
7. Transaction support ensures atomic updates for profile changes
8. Users can only access their own profile via `/me` endpoints
9. Admins can access any user's profile via `/:userId` endpoints
