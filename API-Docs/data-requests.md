# Data Requests API Documentation

API endpoints for users to request new car data (brands, models, variants) and location data (states, cities), and for admins to review and approve/reject these requests.

## Base URLs

- **End User**: `/api/end-user/data-requests`
- **Admin Panel**: `/api/panel/data-requests`

---

## End User Endpoints

### 1. Create Data Request

**POST** `/api/end-user/data-requests`

Submit a request to add new car data or location data.

**Authentication**: Required (JWT)

**Request Body (Car Brand)**:
```json
{
  "requestType": "brand",
  "brandName": "Tesla",
  "additionalDetails": "Electric vehicle manufacturer"
}
```

**Request Body (Car Model)**:
```json
{
  "requestType": "model",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "additionalDetails": "Compact sedan"
}
```

**Request Body (Car Variant)**:
```json
{
  "requestType": "variant",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Long Range AWD",
  "additionalDetails": "Dual motor, 358 miles range"
}
```

**Request Body (State)**:
```json
{
  "requestType": "state",
  "stateName": "Goa",
  "additionalDetails": "Tourist destination state"
}
```

**Request Body (City)**:
```json
{
  "requestType": "city",
  "stateName": "Goa",
  "cityName": "Panaji",
  "additionalDetails": "Capital city"
}
```

**Validation Rules**:
- `requestType`: Required, must be 'brand', 'model', 'variant', 'state', or 'city'
- **For car requests:**
  - `brandName`: Required, min 2 characters
  - `modelName`: Required if requestType is 'model' or 'variant'
  - `variantName`: Required if requestType is 'variant'
- **For location requests:**
  - `stateName`: Required for 'state' and 'city' requests, min 2 characters
  - `cityName`: Required if requestType is 'city', min 2 characters
- `additionalDetails`: Optional

**Success Response** (200):
```json
{
  "success": true,
  "message": "Data request submitted successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "brand",
    "brandName": "Tesla",
    "modelName": null,
    "variantName": null,
    "stateName": null,
    "cityName": null,
    "additionalDetails": "Electric vehicle manufacturer",
    "status": "pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "rejectionReason": null,
    "createdBrandId": null,
    "createdModelId": null,
    "createdVariantId": null,
    "createdStateId": null,
    "createdCityId": null,
    "createdAt": "2025-03-30T10:00:00.000Z",
    "updatedAt": "2025-03-30T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Invalid request type, missing required fields, or duplicate pending request
- `401`: Unauthorized (no token or invalid token)

---

### 2. Get My Requests

**GET** `/api/end-user/data-requests`

Get all data requests submitted by the authenticated user.

**Authentication**: Required (JWT)

**Query Parameters**:
- `status` (optional): Filter by status ('pending', 'approved', 'rejected')
- `requestType` (optional): Filter by type ('brand', 'model', 'variant', 'state', 'city')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request**:
```
GET /api/end-user/data-requests?status=pending&page=1&limit=10
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "requestType": "brand",
      "brandName": "Tesla",
      "modelName": null,
      "variantName": null,
      "stateName": null,
      "cityName": null,
      "additionalDetails": "Electric vehicle manufacturer",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdBrandId": null,
      "createdModelId": null,
      "createdVariantId": null,
      "createdStateId": null,
      "createdCityId": null,
      "createdAt": "2025-03-30T10:00:00.000Z",
      "updatedAt": "2025-03-30T10:00:00.000Z",
      "user": {
        "id": 123,
        "fullName": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com"
      },
      "reviewer": null,
      "createdBrand": null,
      "createdModel": null,
      "createdVariant": null,
      "createdState": null,
      "createdCity": null
    },
    {
      "id": 2,
      "userId": 123,
      "requestType": "city",
      "brandName": null,
      "modelName": null,
      "variantName": null,
      "stateName": "Goa",
      "cityName": "Panaji",
      "additionalDetails": "Capital city",
      "status": "approved",
      "reviewedBy": 456,
      "reviewedAt": "2025-03-30T11:00:00.000Z",
      "rejectionReason": null,
      "createdBrandId": null,
      "createdModelId": null,
      "createdVariantId": null,
      "createdStateId": 15,
      "createdCityId": 250,
      "createdAt": "2025-03-30T10:30:00.000Z",
      "updatedAt": "2025-03-30T11:00:00.000Z",
      "user": {
        "id": 123,
        "fullName": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com"
      },
      "reviewer": {
        "id": 456,
        "fullName": "Admin User",
        "mobile": "9123456789",
        "email": "admin@example.com"
      },
      "createdBrand": null,
      "createdModel": null,
      "createdVariant": null,
      "createdState": {
        "id": 15,
        "name": "Goa",
        "slug": "goa"
      },
      "createdCity": {
        "id": 250,
        "name": "Panaji",
        "slug": "panaji"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Get Request by ID

**GET** `/api/end-user/data-requests/:id`

Get details of a specific data request (user can only view their own requests).

**Authentication**: Required (JWT)

**URL Parameters**:
- `id`: Request ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Request retrieved successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "variant",
    "brandName": "Tesla",
    "modelName": "Model 3",
    "variantName": "Long Range AWD",
    "stateName": null,
    "cityName": null,
    "additionalDetails": "Dual motor, 358 miles range",
    "status": "approved",
    "reviewedBy": 456,
    "reviewedAt": "2025-03-30T12:00:00.000Z",
    "rejectionReason": null,
    "createdBrandId": 10,
    "createdModelId": 25,
    "createdVariantId": 150,
    "createdStateId": null,
    "createdCityId": null,
    "createdAt": "2025-03-30T10:00:00.000Z",
    "updatedAt": "2025-03-30T12:00:00.000Z",
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "reviewer": {
      "id": 456,
      "fullName": "Admin User",
      "mobile": "9123456789",
      "email": "admin@example.com"
    },
    "createdBrand": {
      "id": 10,
      "name": "Tesla",
      "slug": "tesla"
    },
    "createdModel": {
      "id": 25,
      "name": "Model 3",
      "slug": "tesla-model-3"
    },
    "createdVariant": {
      "id": 150,
      "variantName": "Long Range AWD",
      "slug": "tesla-model-3-long-range-awd"
    },
    "createdState": null,
    "createdCity": null
  }
}
```

**Error Responses**:
- `403`: User does not have permission to view this request
- `404`: Request not found

---

## Admin Panel Endpoints

### 4. Get All Requests

**GET** `/api/panel/data-requests`

Get all data requests with filters (admin only).

**Authentication**: Required (JWT + super_admin role)

**Query Parameters**:
- `status` (optional): Filter by status ('pending', 'approved', 'rejected')
- `requestType` (optional): Filter by type ('brand', 'model', 'variant', 'state', 'city')
- `search` (optional): Search in brand name, model name, variant name, state name, city name, user name, mobile, or email
- `startDate` (optional): Filter requests created on or after this date (ISO 8601 format: YYYY-MM-DD)
- `endDate` (optional): Filter requests created on or before this date (ISO 8601 format: YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Requests**:
```
# Filter by status and type
GET /api/panel/data-requests?status=pending&requestType=brand&page=1&limit=20

# Search for "Tesla"
GET /api/panel/data-requests?search=Tesla

# Filter by date range
GET /api/panel/data-requests?startDate=2025-03-01&endDate=2025-03-31

# Search with filters
GET /api/panel/data-requests?search=Goa&requestType=city&status=pending

# Search by user name or mobile
GET /api/panel/data-requests?search=John

# Complex filter
GET /api/panel/data-requests?status=approved&startDate=2025-03-01&search=Tesla&page=1&limit=10
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "requestType": "brand",
      "brandName": "Tesla",
      "modelName": null,
      "variantName": null,
      "stateName": null,
      "cityName": null,
      "additionalDetails": "Electric vehicle manufacturer",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdBrandId": null,
      "createdModelId": null,
      "createdVariantId": null,
      "createdStateId": null,
      "createdCityId": null,
      "createdAt": "2025-03-30T10:00:00.000Z",
      "updatedAt": "2025-03-30T10:00:00.000Z",
      "user": {
        "id": 123,
        "fullName": "John Doe",
        "mobile": "9876543210",
        "email": "john@example.com"
      },
      "reviewer": null,
      "createdBrand": null,
      "createdModel": null,
      "createdVariant": null,
      "createdState": null,
      "createdCity": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 5. Get Request by ID (Admin)

**GET** `/api/panel/data-requests/:id`

Get details of any data request (admin only).

**Authentication**: Required (JWT + super_admin role)

**URL Parameters**:
- `id`: Request ID

**Success Response**: Same as end-user endpoint #3

---

### 6. Approve Request

**PATCH** `/api/panel/data-requests/approve/:id`

Approve a data request and create the brand/model/variant/state/city.

**Authentication**: Required (JWT + super_admin role)

**URL Parameters**:
- `id`: Request ID

**Request Body (Brand Approval)**:
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA"
  }
}
```

**Request Body (Model Approval)**:
```json
{
  "createData": {
    "name": "Model 3",
    "launchYear": 2017
  }
}
```

**Request Body (Model Approval with Variant)**:
```json
{
  "createData": {
    "name": "Model 3",
    "launchYear": 2017,
    "variant": {
      "variantName": "Long Range AWD",
      "modelYear": 2024,
      "bodyType": "sedan",
      "fuelType": "electric",
      "transmissionType": "automatic",
      "seatingCapacity": 5
    }
  }
}
```

**Request Body (Variant Approval)**:
```json
{
  "createData": {
    "variantName": "Long Range AWD",
    "modelYear": 2024,
    "bodyType": "sedan",
    "fuelType": "electric",
    "transmissionType": "automatic",
    "seatingCapacity": 5
  }
}
```

**Request Body (State Approval)**:
```json
{
  "createData": {
    "name": "Goa",
    "regionSlug": "west",
    "regionName": "West India"
  }
}
```

**Request Body (City Approval)**:
```json
{
  "createData": {
    "name": "Panaji",
    "latitude": 15.4909,
    "longitude": 73.8278
  }
}
```

**Validation Rules**:
- `createData`: Required object with creation details
- Request must be in 'pending' status
- If parent entities don't exist, they will be auto-created

**Success Response** (200):
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "brand",
    "brandName": "Tesla",
    "status": "approved",
    "reviewedBy": 456,
    "reviewedAt": "2025-03-30T12:00:00.000Z",
    "createdBrandId": 10,
    "createdModelId": null,
    "createdVariantId": null,
    "createdStateId": null,
    "createdCityId": null,
    "createdAt": "2025-03-30T10:00:00.000Z",
    "updatedAt": "2025-03-30T12:00:00.000Z",
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "reviewer": {
      "id": 456,
      "fullName": "Admin User",
      "mobile": "9123456789",
      "email": "admin@example.com"
    },
    "createdBrand": {
      "id": 10,
      "name": "Tesla",
      "slug": "tesla"
    }
  }
}
```

**Error Responses**:
- `400`: Missing createData, request already processed, or validation error
- `401`: Unauthorized
- `403`: Insufficient permissions (not super_admin)
- `404`: Request not found

**Notes**:
- Approval creates the actual entity in the database
- If parent entities (brand/model/state) don't exist, they are auto-created
- When approving a model request, you can optionally include variant data to create both model and variant in one operation
- Transaction ensures all-or-nothing operation
- Slug is auto-generated from names

---

### 7. Reject Request

**PATCH** `/api/panel/data-requests/reject/:id`

Reject a data request with a reason.

**Authentication**: Required (JWT + super_admin role)

**URL Parameters**:
- `id`: Request ID

**Request Body**:
```json
{
  "rejectionReason": "This brand already exists in our database as 'Tesla Motors'. Please search again."
}
```

**Validation Rules**:
- `rejectionReason`: Required, min 10 characters
- Request must be in 'pending' status

**Success Response** (200):
```json
{
  "success": true,
  "message": "Request rejected successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "brand",
    "brandName": "Tesla",
    "status": "rejected",
    "reviewedBy": 456,
    "reviewedAt": "2025-03-30T12:00:00.000Z",
    "rejectionReason": "This brand already exists in our database as 'Tesla Motors'. Please search again.",
    "createdBrandId": null,
    "createdModelId": null,
    "createdVariantId": null,
    "createdStateId": null,
    "createdCityId": null,
    "createdAt": "2025-03-30T10:00:00.000Z",
    "updatedAt": "2025-03-30T12:00:00.000Z",
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com"
    },
    "reviewer": {
      "id": 456,
      "fullName": "Admin User",
      "mobile": "9123456789",
      "email": "admin@example.com"
    }
  }
}
```

**Error Responses**:
- `400`: Missing/invalid rejection reason, or request already processed
- `401`: Unauthorized
- `403`: Insufficient permissions (not super_admin)
- `404`: Request not found

---

### 8. Get Statistics

**GET** `/api/panel/data-requests/statistics`

Get statistics about data requests.

**Authentication**: Required (JWT + super_admin role)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 250,
    "pending": 45,
    "approved": 180,
    "rejected": 25,
    "byType": {
      "brand": 30,
      "model": 60,
      "variant": 80,
      "state": 40,
      "city": 40
    }
  }
}
```

---

## Status Flow

```
pending → approved (creates entity)
pending → rejected (with reason)
```

Once a request is approved or rejected, it cannot be changed.

---

## Frontend Integration

### User Flow - Submit Car Brand Request

```javascript
const submitBrandRequest = async () => {
  try {
    const response = await fetch('/api/end-user/data-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requestType: 'brand',
        brandName: 'Tesla',
        additionalDetails: 'Electric vehicle manufacturer'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Request submitted! We will review it soon.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### User Flow - Submit City Request

```javascript
const submitCityRequest = async () => {
  try {
    const response = await fetch('/api/end-user/data-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requestType: 'city',
        stateName: 'Goa',
        cityName: 'Panaji',
        additionalDetails: 'Capital city'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('City request submitted successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### User Flow - Check Request Status

```javascript
const checkMyRequests = async () => {
  try {
    const response = await fetch('/api/end-user/data-requests?status=pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    // Display user's requests with status
    data.data.forEach(request => {
      console.log(`${request.requestType}: ${request.brandName || request.cityName} - Status: ${request.status}`);
      if (request.status === 'rejected') {
        console.log(`Reason: ${request.rejectionReason}`);
      }
      if (request.status === 'approved') {
        console.log('✅ Now available on website!');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Admin Flow - Review Requests

```javascript
// Get pending requests
const getPendingRequests = async () => {
  try {
    const response = await fetch('/api/panel/data-requests?status=pending', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Search requests
const searchRequests = async (searchTerm) => {
  try {
    const response = await fetch(`/api/panel/data-requests?search=${encodeURIComponent(searchTerm)}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Filter by date range
const getRequestsByDateRange = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate, // Format: YYYY-MM-DD
      endDate: endDate
    });
    
    const response = await fetch(`/api/panel/data-requests?${params}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Complex filter example
const getFilteredRequests = async (filters) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.requestType) params.append('requestType', filters.requestType);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await fetch(`/api/panel/data-requests?${params}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Approve car brand request
const approveBrandRequest = async (requestId) => {
  try {
    const response = await fetch(`/api/panel/data-requests/approve/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        createData: {
          name: 'Tesla',
          nameLocal: 'टेस्ला',
          description: 'American electric vehicle manufacturer',
          countryOfOrigin: 'USA'
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Request approved! Brand created successfully.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Approve city request
const approveCityRequest = async (requestId) => {
  try {
    const response = await fetch(`/api/panel/data-requests/approve/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        createData: {
          name: 'Panaji',
          latitude: 15.4909,
          longitude: 73.8278
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('City request approved! City created successfully.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Reject request
const rejectRequest = async (requestId) => {
  try {
    const response = await fetch(`/api/panel/data-requests/reject/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        rejectionReason: 'This data already exists in our database. Please search again.'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Request rejected.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get statistics for dashboard
const getStatistics = async () => {
  try {
    const response = await fetch('/api/panel/data-requests/statistics', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    console.log('Total Requests:', data.data.total);
    console.log('Pending:', data.data.pending);
    console.log('By Type:', data.data.byType);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Error Codes

- `400`: Bad Request (validation errors, duplicate request, already processed)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (request doesn't exist)
- `500`: Internal Server Error

---

## Notes

1. **Unified Table**: Single table handles both car data and location data requests
2. **Duplicate Prevention**: System checks for duplicate pending requests with same data
3. **Auto-Creation**: When approving model/variant/city requests, parent entities are auto-created if they don't exist
4. **Transaction Safety**: All approval operations use database transactions
5. **Slug Generation**: Slugs are auto-generated from names (lowercase, hyphenated)
6. **Explicit Payloads**: Approve/reject endpoints require explicit data in request body
7. **Once Approved**: Approved data immediately appears on the website
8. **Audit Trail**: All requests track who created and who reviewed them
9. **Flexible Validation**: Different validation rules apply based on request type
10. **Nullable Fields**: Car fields are null for location requests, location fields are null for car requests
