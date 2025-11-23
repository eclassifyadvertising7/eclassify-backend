# Categories API Documentation

## Overview

Categories module provides endpoints for managing listing categories (Cars, Properties, etc.). Categories are small lookup tables that organize listings into different types.

**Base URL:** `/api`

---

## Public Endpoints (No Authentication)

### 1. Get All Active Categories

Get list of all active categories for public browsing.

**Endpoint:** `GET /api/public/categories`

**Query Parameters:**
- `featured` (optional, boolean) - Filter by featured categories only

**Request Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars",
      "slug": "cars",
      "description": "Buy and sell new and used cars",
      "icon": "http://localhost:5000/uploads/categories/2024/11/cars-icon.jpg",
      "imageUrl": "http://localhost:5000/uploads/categories/2024/11/cars-banner.jpg",
      "displayOrder": 1,
      "isFeatured": true,
      "isActive": true,
      "createdAt": "2024-11-23T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    }
  ]
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/public/categories?featured=true"
```

---

### 2. Get Category by Slug

Get single category details by slug.

**Endpoint:** `GET /api/public/categories/:slug`

**URL Parameters:**
- `slug` (required, string) - Category slug (e.g., "cars", "properties")

**Request Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Cars",
    "slug": "cars",
    "description": "Buy and sell new and used cars",
    "icon": "http://localhost:5000/uploads/categories/2024/11/cars-icon.jpg",
    "imageUrl": "http://localhost:5000/uploads/categories/2024/11/cars-banner.jpg",
    "displayOrder": 1,
    "isFeatured": true,
    "isActive": true,
    "createdAt": "2024-11-23T10:00:00.000Z",
    "updatedAt": "2024-11-23T10:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/public/categories/cars"
```

---

## Panel Endpoints (Admin/Staff - Authentication Required)

### 3. Create Category

Create a new category with optional image upload.

**Endpoint:** `POST /api/panel/categories`

**Authentication:** Required (JWT token)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `name` (required, string, min 2 chars) - Category name
- `slug` (optional, string) - Auto-generated from name if not provided
- `description` (optional, string) - Category description
- `displayOrder` (optional, integer) - Display order (default: 0)
- `isFeatured` (optional, boolean) - Featured status (default: true)
- `isActive` (optional, boolean) - Active status (default: true)
- `icon` (optional, file) - Category icon (max 2MB, jpg/png/webp)
- `image` (optional, file) - Category banner image (max 2MB, jpg/png/webp)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 3,
    "name": "Electronics",
    "slug": "electronics",
    "description": "Buy and sell electronics",
    "icon": null,
    "imageUrl": "http://localhost:5000/uploads/categories/2024/11/electronics-abc123.jpg",
    "displayOrder": 3,
    "isFeatured": true,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "deletedBy": null,
    "createdAt": "2024-11-23T10:00:00.000Z",
    "updatedAt": "2024-11-23T10:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Category name already exists"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/panel/categories" \
  -H "Authorization: Bearer <token>" \
  -F "name=Electronics" \
  -F "description=Buy and sell electronics" \
  -F "displayOrder=3" \
  -F "icon=@/path/to/icon.jpg" \
  -F "image=@/path/to/banner.jpg"
```

---

### 4. Get All Categories (Admin)

Get all categories including inactive ones with optional filters.

**Endpoint:** `GET /api/panel/categories`

**Authentication:** Required (JWT token)

**Query Parameters:**
- `isActive` (optional, boolean) - Filter by active status
- `isFeatured` (optional, boolean) - Filter by featured status
- `search` (optional, string) - Search by name or slug

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars",
      "slug": "cars",
      "description": "Buy and sell new and used cars",
      "icon": "http://localhost:5000/uploads/categories/2024/11/cars-icon.jpg",
      "imageUrl": "http://localhost:5000/uploads/categories/2024/11/cars-banner.jpg",
      "displayOrder": 1,
      "isFeatured": true,
      "isActive": true,
      "createdBy": null,
      "updatedBy": [
        {
          "userId": 1,
          "userName": "admin@example.com",
          "timestamp": "2024-11-23T10:00:00.000Z"
        }
      ],
      "deletedBy": null,
      "createdAt": "2024-11-23T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    }
  ]
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/panel/categories?isActive=true&search=car" \
  -H "Authorization: Bearer <token>"
```

---

### 5. Get Category by ID

Get single category details by ID.

**Endpoint:** `GET /api/panel/categories/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` (required, integer) - Category ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Cars",
    "slug": "cars",
    "description": "Buy and sell new and used cars",
    "icon": "http://localhost:5000/uploads/categories/2024/11/cars-icon.jpg",
    "imageUrl": "http://localhost:5000/uploads/categories/2024/11/cars-banner.jpg",
    "displayOrder": 1,
    "isFeatured": true,
    "isActive": true,
    "createdBy": null,
    "updatedBy": null,
    "deletedBy": null,
    "createdAt": "2024-11-23T10:00:00.000Z",
    "updatedAt": "2024-11-23T10:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/panel/categories/1" \
  -H "Authorization: Bearer <token>"
```

---

### 6. Update Category

Update category details with optional image upload.

**Endpoint:** `PUT /api/panel/categories/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` (required, integer) - Category ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `name` (optional, string, min 2 chars) - Category name
- `slug` (optional, string) - Category slug
- `description` (optional, string) - Category description
- `displayOrder` (optional, integer) - Display order
- `isFeatured` (optional, boolean) - Featured status
- `isActive` (optional, boolean) - Active status
- `icon` (optional, file) - Category icon (replaces existing)
- `image` (optional, file) - Category banner image (replaces existing)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Cars & Vehicles",
    "slug": "cars-vehicles",
    "description": "Buy and sell new and used cars and vehicles",
    "icon": "http://localhost:5000/uploads/categories/2024/11/cars-icon.jpg",
    "imageUrl": "http://localhost:5000/uploads/categories/2024/11/cars-new-xyz789.jpg",
    "displayOrder": 1,
    "isFeatured": true,
    "isActive": true,
    "createdBy": null,
    "updatedBy": [
      {
        "userId": 1,
        "userName": "admin@example.com",
        "timestamp": "2024-11-23T11:00:00.000Z"
      }
    ],
    "deletedBy": null,
    "createdAt": "2024-11-23T10:00:00.000Z",
    "updatedAt": "2024-11-23T11:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Category name already exists"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/panel/categories/1" \
  -H "Authorization: Bearer <token>" \
  -F "name=Cars & Vehicles" \
  -F "description=Buy and sell new and used cars and vehicles" \
  -F "icon=@/path/to/new-icon.jpg" \
  -F "image=@/path/to/new-banner.jpg"
```

---

### 7. Update Category Status

Update category active/inactive status.

**Endpoint:** `PATCH /api/panel/categories/status/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` (required, integer) - Category ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category status updated successfully",
  "data": {
    "id": 1,
    "name": "Cars",
    "slug": "cars",
    "isActive": false,
    "updatedBy": [
      {
        "userId": 1,
        "userName": "admin@example.com",
        "timestamp": "2024-11-23T11:00:00.000Z"
      }
    ],
    "updatedAt": "2024-11-23T11:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "isActive field is required"
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/panel/categories/status/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

---

### 8. Update Category Featured Status

Update category featured status.

**Endpoint:** `PATCH /api/panel/categories/featured/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` (required, integer) - Category ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isFeatured": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category featured status updated successfully",
  "data": {
    "id": 1,
    "name": "Cars",
    "slug": "cars",
    "isFeatured": true,
    "updatedBy": [
      {
        "userId": 1,
        "userName": "admin@example.com",
        "timestamp": "2024-11-23T11:00:00.000Z"
      }
    ],
    "updatedAt": "2024-11-23T11:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "isFeatured field is required"
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/panel/categories/featured/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isFeatured": true}'
```

---

### 9. Delete Category

Soft delete a category.

**Endpoint:** `DELETE /api/panel/categories/:id`

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` (required, integer) - Category ID

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/panel/categories/1" \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Category Object

```typescript
{
  id: number;                    // Category ID
  name: string;                  // Category name (unique)
  slug: string;                  // URL-friendly slug (unique)
  description: string | null;    // Category description
  icon: string | null;           // Absolute URL to icon image
  imageUrl: string | null;       // Absolute URL to banner image
  displayOrder: number;          // Display order (for sorting)
  isFeatured: boolean;           // Featured on homepage
  isActive: boolean;             // Active/inactive status
  createdBy: number | null;      // User ID who created
  updatedBy: Array<{             // Update history
    userId: number;
    userName: string;
    timestamp: string;
  }> | null;
  deletedBy: number | null;      // User ID who deleted
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  deletedAt: string | null;      // ISO timestamp (soft delete)
}
```

---

## Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Category not found |
| 500 | Internal Server Error | Server error |

---

## Business Rules

1. **Slug Generation**: Auto-generated from name using `customSlugify` if not provided
2. **Unique Constraints**: Name and slug must be unique
3. **Image Upload**: Max 2MB per file, formats: JPG, PNG, WebP
4. **Two Image Types**: 
   - `icon` - Category icon/logo
   - `image` - Category banner/cover image
5. **Image Processing**: Auto-compressed and resized to max 1920x1080
6. **Filename Generation**: Uses timestamp + slugified name + random chars
7. **Form Data Conversion**: All form data properly parsed and type-converted
8. **Soft Delete**: Categories are soft-deleted (can be restored)
9. **Audit Trail**: All updates tracked in `updatedBy` JSON array
10. **URL Storage**: Database stores relative paths, API returns absolute URLs

---

## Notes

- All image URLs returned are absolute (e.g., `http://localhost:5000/uploads/...`)
- Database stores relative paths only (e.g., `uploads/categories/...`)
- Change `UPLOAD_URL` environment variable when switching storage platforms
- Categories are small lookup tables (~5-10 records)
- Public endpoints only return active categories
- Panel endpoints return all categories including inactive ones

