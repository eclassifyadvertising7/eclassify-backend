# Location API Documentation

## Overview

Location endpoints for managing states, cities, and popular cities.

---

## Public Endpoints

### 1. Get All States

**Endpoint:** `GET /api/common/states`

**Description:** Get all active states

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "slug": "maharashtra",
      "name": "Maharashtra",
      "regionSlug": "west",
      "regionName": "West"
    }
  ]
}
```

---

### 2. Get Cities by State

**Endpoint:** `GET /api/common/cities/:stateId`

**Description:** Get all cities for a specific state

**Authentication:** Not required

**Parameters:**
- `stateId` (path parameter) - State ID

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Mumbai",
      "district": "Mumbai",
      "stateName": "Maharashtra",
      "pincode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777"
    }
  ]
}
```

---

### 3. Get All Cities

**Endpoint:** `GET /api/common/all-cities`

**Description:** Get all cities irrespective of state

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Mumbai",
      "district": "Mumbai",
      "stateName": "Maharashtra",
      "pincode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777"
    }
  ]
}
```

---

### 4. Get Popular Cities

**Endpoint:** `GET /api/common/popular-cities`

**Description:** Get all cities marked as popular

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Mumbai",
      "slug": "mumbai",
      "district": "Mumbai",
      "stateName": "Maharashtra",
      "stateId": 1,
      "pincode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777",
      "displayOrder": 1
    },
    {
      "id": 5,
      "name": "Delhi",
      "slug": "delhi",
      "district": "Central Delhi",
      "stateName": "Delhi",
      "stateId": 7,
      "pincode": "110001",
      "latitude": "28.7041",
      "longitude": "77.1025",
      "displayOrder": 2
    }
  ]
}
```

---

### 5. Search Cities

**Endpoint:** `GET /api/common/search-cities`

**Description:** Search cities by name (useful for autocomplete/search features)

**Authentication:** Not required

**Query Parameters:**
- `query` (required, string, min 2 characters) - Search term
- `stateId` (optional, integer) - Filter by state ID
- `limit` (optional, integer, default: 10) - Maximum results to return

**Example Requests:**
```
GET /api/common/search-cities?query=mum
GET /api/common/search-cities?query=bang&stateId=30
GET /api/common/search-cities?query=pune&limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Mumbai",
      "slug": "mumbai",
      "district": "Mumbai",
      "stateName": "Maharashtra",
      "stateId": 1,
      "pincode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777",
      "isPopular": true
    },
    {
      "id": 15,
      "name": "Mumbai Suburban",
      "slug": "mumbai-suburban",
      "district": "Mumbai Suburban",
      "stateName": "Maharashtra",
      "stateId": 1,
      "pincode": "400050",
      "latitude": "19.1136",
      "longitude": "72.9083",
      "isPopular": false
    }
  ]
}
```

**Error Response (Invalid Query):**
```json
{
  "success": false,
  "message": "Search query must be at least 2 characters"
}
```

**Notes:**
- Results are ordered by: popular cities first, then by display order, then alphabetically
- Search is case-insensitive
- Only active and non-deleted cities are returned
- Useful for implementing city autocomplete in search forms

---

## Panel Endpoints (Super Admin Only)

### 6. Get All States (Admin)

**Endpoint:** `GET /api/panel/locations/states/view`

**Description:** Get all states including inactive and deleted ones (for admin management) with pagination and search

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional, integer, default: 1) - Page number
- `limit` (optional, integer, default: 50) - Items per page
- `search` (optional, string) - Search by state name

**Example Requests:**
```
GET /api/panel/locations/states/view
GET /api/panel/locations/states/view?page=2&limit=20
GET /api/panel/locations/states/view?search=kar
GET /api/panel/locations/states/view?search=maha&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "states": [
      {
        "id": 1,
        "slug": "maharashtra",
        "name": "Maharashtra",
        "regionSlug": "west",
        "regionName": "West",
        "displayOrder": 1,
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 36,
      "itemsPerPage": 50,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 7. Create State

**Endpoint:** `POST /api/panel/locations/states/create`

**Description:** Create a new state

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Karnataka",
  "slug": "karnataka",
  "regionSlug": "south",
  "regionName": "South",
  "displayOrder": 10,
  "isActive": true
}
```

**Required Fields:**
- `name` (string, min 2 characters)

**Optional Fields:**
- `slug` (string) - Auto-generated from name if not provided
- `regionSlug` (string)
- `regionName` (string)
- `displayOrder` (integer, default: 0)
- `isActive` (boolean, default: true)

**Response:**
```json
{
  "success": true,
  "message": "State created successfully",
  "data": {
    "id": 30,
    "slug": "karnataka",
    "name": "Karnataka",
    "regionSlug": "south",
    "regionName": "South",
    "displayOrder": 10,
    "isActive": true,
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 8. Update State

**Endpoint:** `PUT /api/panel/locations/states/edit/:stateId`

**Description:** Update an existing state

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Parameters:**
- `stateId` (path parameter) - State ID

**Request Body:**
```json
{
  "name": "Karnataka Updated",
  "displayOrder": 5,
  "isActive": false
}
```

**All fields are optional** - only send fields you want to update

**Response:**
```json
{
  "success": true,
  "message": "State updated successfully",
  "data": {
    "id": 30,
    "slug": "karnataka",
    "name": "Karnataka Updated",
    "regionSlug": "south",
    "regionName": "South",
    "displayOrder": 5,
    "isActive": false,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 9. Delete State

**Endpoint:** `DELETE /api/panel/locations/states/delete/:stateId`

**Description:** Soft delete a state

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `stateId` (path parameter) - State ID

**Response:**
```json
{
  "success": true,
  "message": "State deleted successfully",
  "data": null
}
```

---

### 10. Get All Cities (Admin)

**Endpoint:** `GET /api/panel/locations/cities/view`

**Description:** Get all cities including inactive and deleted ones (for admin management)

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Mumbai",
      "slug": "mumbai",
      "stateId": 1,
      "stateName": "Maharashtra",
      "district": "Mumbai",
      "districtId": 10,
      "pincode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777",
      "displayOrder": 1,
      "isActive": true,
      "isPopular": true,
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 11. Get Cities by State (Admin)

**Endpoint:** `GET /api/panel/locations/cities/view-by-state/:stateId`

**Description:** Get all cities for a specific state including inactive and deleted ones with pagination and search

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `stateId` (path parameter, required) - State ID

**Query Parameters:**
- `page` (optional, integer, default: 1) - Page number
- `limit` (optional, integer, default: 50) - Items per page
- `search` (optional, string) - Search by city name

**Example Requests:**
```
GET /api/panel/locations/cities/view-by-state/1
GET /api/panel/locations/cities/view-by-state/1?page=2&limit=20
GET /api/panel/locations/cities/view-by-state/1?search=mum
GET /api/panel/locations/cities/view-by-state/1?search=pune&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "cities": [
      {
        "id": 1,
        "name": "Mumbai",
        "slug": "mumbai",
        "stateId": 1,
        "stateName": "Maharashtra",
        "district": "Mumbai",
        "districtId": 10,
        "pincode": "400001",
        "latitude": "19.0760",
        "longitude": "72.8777",
        "displayOrder": 1,
        "isActive": true,
        "isPopular": true,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 245,
      "itemsPerPage": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 12. Create City

**Endpoint:** `POST /api/panel/locations/cities/create`

**Description:** Create a new city

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Bangalore",
  "slug": "bangalore",
  "stateId": 30,
  "stateName": "Karnataka",
  "district": "Bangalore Urban",
  "districtId": 150,
  "pincode": "560001",
  "latitude": "12.9716",
  "longitude": "77.5946",
  "displayOrder": 1,
  "isActive": true,
  "isPopular": true
}
```

**Required Fields:**
- `name` (string, min 2 characters)
- `stateId` (integer)

**Optional Fields:**
- `slug` (string) - Auto-generated from name if not provided
- `stateName` (string) - Auto-filled from state if not provided
- `district` (string)
- `districtId` (integer)
- `pincode` (string)
- `latitude` (decimal)
- `longitude` (decimal)
- `displayOrder` (integer, default: 0)
- `isActive` (boolean, default: true)
- `isPopular` (boolean, default: false)

**Response:**
```json
{
  "success": true,
  "message": "City created successfully",
  "data": {
    "id": 500,
    "name": "Bangalore",
    "slug": "bangalore",
    "stateId": 30,
    "stateName": "Karnataka",
    "district": "Bangalore Urban",
    "districtId": 150,
    "pincode": "560001",
    "latitude": "12.9716",
    "longitude": "77.5946",
    "displayOrder": 1,
    "isActive": true,
    "isPopular": true,
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 13. Update City

**Endpoint:** `PUT /api/panel/locations/cities/edit/:cityId`

**Description:** Update an existing city

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Parameters:**
- `cityId` (path parameter) - City ID

**Request Body:**
```json
{
  "name": "Bengaluru",
  "displayOrder": 1,
  "isPopular": true,
  "isActive": true
}
```

**All fields are optional** - only send fields you want to update

**Response:**
```json
{
  "success": true,
  "message": "City updated successfully",
  "data": {
    "id": 500,
    "name": "Bengaluru",
    "slug": "bangalore",
    "stateId": 30,
    "stateName": "Karnataka",
    "displayOrder": 1,
    "isActive": true,
    "isPopular": true,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 14. Delete City

**Endpoint:** `DELETE /api/panel/locations/cities/delete/:cityId`

**Description:** Soft delete a city

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `cityId` (path parameter) - City ID

**Response:**
```json
{
  "success": true,
  "message": "City deleted successfully",
  "data": null
}
```

---

### 15. Toggle City Popularity

**Endpoint:** `PATCH /api/panel/locations/cities/popularity/:cityId`

**Description:** Mark or unmark a city as popular

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `cityId` (path parameter) - City ID

**Request Body:**
```json
{
  "isPopular": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "City marked as popular",
  "data": {
    "id": 1,
    "name": "Mumbai",
    "slug": "mumbai",
    "isPopular": true
  }
}
```

**Response (Unmark):**
```json
{
  "success": true,
  "message": "City unmarked as popular",
  "data": {
    "id": 1,
    "name": "Mumbai",
    "slug": "mumbai",
    "isPopular": false
  }
}
```

**Error Responses:**

**Invalid City ID:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "cityId",
      "message": "Valid city ID is required"
    }
  ]
}
```

**Invalid isPopular Value:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "isPopular",
      "message": "isPopular must be a boolean value"
    }
  ]
}
```

**City Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

---

## Common Error Responses

**State/City Already Exists:**
```json
{
  "success": false,
  "message": "State with this slug already exists"
}
```

**State/City Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Invalid State ID:**
```json
{
  "success": false,
  "message": "Invalid state ID"
}
```

**Invalid City Name:**
```json
{
  "success": false,
  "message": "City name must be at least 2 characters"
}
```

**State Not Found (when creating city):**
```json
{
  "success": false,
  "message": "State not found"
}
```

**Already Deleted:**
```json
{
  "success": false,
  "message": "City is already deleted"
}
```

---

## Use Cases

### Frontend: Display Popular Cities on Homepage

```javascript
// Fetch popular cities for homepage
const response = await fetch('http://localhost:5000/api/common/popular-cities');
const { data } = await response.json();

// Display cities
data.forEach(city => {
  console.log(`${city.name}, ${city.stateName}`);
});
```

### Frontend: City Search Autocomplete

```javascript
// Implement city search autocomplete
const searchCities = async (searchTerm) => {
  if (searchTerm.length < 2) return [];
  
  const response = await fetch(
    `http://localhost:5000/api/common/search-cities?query=${encodeURIComponent(searchTerm)}&limit=10`
  );
  const { data } = await response.json();
  
  return data.map(city => ({
    value: city.id,
    label: `${city.name}, ${city.stateName}`,
    ...city
  }));
};

// Usage in search input
const handleSearchInput = async (e) => {
  const results = await searchCities(e.target.value);
  // Display results in dropdown
};
```

### Frontend: Filter Cities by State

```javascript
// Get cities for a specific state
const getCitiesByState = async (stateId) => {
  const response = await fetch(
    `http://localhost:5000/api/common/search-cities?query=&stateId=${stateId}&limit=100`
  );
  const { data } = await response.json();
  return data;
};
```

### Admin Panel: Create New State

```javascript
// Create a new state
const response = await fetch('http://localhost:5000/api/panel/locations/states/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Karnataka',
    regionSlug: 'south',
    regionName: 'South',
    displayOrder: 10,
    isActive: true
  })
});

const result = await response.json();
console.log(result.message); // "State created successfully"
```

### Admin Panel: Create New City

```javascript
// Create a new city
const response = await fetch('http://localhost:5000/api/panel/locations/cities/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Bangalore',
    stateId: 30,
    district: 'Bangalore Urban',
    pincode: '560001',
    latitude: '12.9716',
    longitude: '77.5946',
    isPopular: true,
    isActive: true
  })
});

const result = await response.json();
console.log(result.message); // "City created successfully"
```

### Admin Panel: Update City

```javascript
// Update city details
const response = await fetch('http://localhost:5000/api/panel/locations/cities/edit/500', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Bengaluru',
    isPopular: true
  })
});

const result = await response.json();
console.log(result.message); // "City updated successfully"
```

### Admin Panel: Mark City as Popular

```javascript
// Mark Mumbai as popular
const response = await fetch('http://localhost:5000/api/panel/locations/cities/popularity/1', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    isPopular: true
  })
});

const result = await response.json();
console.log(result.message); // "City marked as popular"
```

### Admin Panel: Delete State

```javascript
// Soft delete a state
const response = await fetch('http://localhost:5000/api/panel/locations/states/delete/30', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();
console.log(result.message); // "State deleted successfully"
```

---

## Notes

1. **Popular Cities** are typically displayed on the homepage or search page for quick access
2. **Display Order** determines the order in which popular cities appear
3. Only **Super Admin** can manage states and cities (create, update, delete, toggle popularity)
4. Popular cities must be **active** (`isActive: true`) to appear in the public list
5. Soft-deleted cities (`isDeleted: true`) are excluded from public endpoints but visible in admin endpoints
6. **Slug** is auto-generated from name if not provided (lowercase, hyphenated)
7. When creating a city, the **state must exist** and be valid
8. **stateName** is auto-filled from the state if not provided during city creation
9. Deleting a state does **not cascade delete** its cities (cities remain but may become orphaned)
10. **Latitude/Longitude** are optional but recommended for location-based features
11. **updatedBy** field tracks the last admin who modified the record (stored as userId for high-volume tables)
12. **Admin endpoints support pagination and search** for better performance with large datasets
13. **City management requires state selection first** - always filter cities by state ID to avoid loading all cities at once
14. **Search is case-insensitive** and uses partial matching (ILIKE operator)
