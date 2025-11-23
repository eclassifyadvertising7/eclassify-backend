# Car Data API Documentation

Complete API documentation for car brands, models, variants, and specifications endpoints.

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Public Endpoints** |
| GET | `/api/public/car-brands` | ❌ | Get active brands (grouped: featured/all) |
| GET | `/api/public/car-models?brandId=10` | ❌ | Get models by brand |
| GET | `/api/public/car-variants?modelId=45` | ❌ | Get variants by model |
| GET | `/api/public/car-specifications/:variantId` | ❌ | Get specification by variant |
| **Panel Endpoints** |
| GET | `/api/panel/car-brands` | ✅ Admin | Get all brands (flat list, active+inactive) |
| POST | `/api/panel/car-brands` | ✅ Admin | Create brand |
| GET | `/api/panel/car-brands/:id` | ✅ Admin | Get brand by ID |
| PUT | `/api/panel/car-brands/:id` | ✅ Admin | Update brand |
| DELETE | `/api/panel/car-brands/:id` | ✅ Admin | Delete brand |
| GET | `/api/panel/car-models?brandId=10` | ✅ Admin | Get models (admin) |
| POST | `/api/panel/car-models` | ✅ Admin | Create model |
| GET | `/api/panel/car-models/:id` | ✅ Admin | Get model by ID |
| PUT | `/api/panel/car-models/:id` | ✅ Admin | Update model |
| DELETE | `/api/panel/car-models/:id` | ✅ Admin | Delete model |
| GET | `/api/panel/car-variants?modelId=45` | ✅ Admin | Get variants (admin) |
| POST | `/api/panel/car-variants` | ✅ Admin | Create variant |
| GET | `/api/panel/car-variants/:id` | ✅ Admin | Get variant by ID |
| PUT | `/api/panel/car-variants/:id` | ✅ Admin | Update variant |
| DELETE | `/api/panel/car-variants/:id` | ✅ Admin | Delete variant |

---

## Public Endpoints

### 1. Get All Car Brands

Get list of all active car brands grouped into featured and all sections.

**Endpoint:** `GET /api/public/car-brands`

**Query Parameters:**
- `search` (optional) - Search by brand name

**Example:** `GET /api/public/car-brands`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car brands retrieved successfully",
  "data": {
    "featured": [
      {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota",
        "logoUrl": "http://localhost:5000/uploads/brands/toyota-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 25
      },
      {
        "id": 2,
        "name": "Honda",
        "slug": "honda",
        "logoUrl": "http://localhost:5000/uploads/brands/honda-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 18
      },
      {
        "id": 5,
        "name": "Maruti Suzuki",
        "slug": "maruti-suzuki",
        "logoUrl": "http://localhost:5000/uploads/brands/maruti-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 32
      }
    ],
    "all": [
      {
        "id": 8,
        "name": "Audi",
        "slug": "audi",
        "logoUrl": "http://localhost:5000/uploads/brands/audi-logo.png",
        "isPopular": false,
        "isFeatured": false,
        "totalModels": 12
      },
      {
        "id": 10,
        "name": "BMW",
        "slug": "bmw",
        "logoUrl": "http://localhost:5000/uploads/brands/bmw-logo.png",
        "isPopular": false,
        "isFeatured": false,
        "totalModels": 15
      },
      {
        "id": 2,
        "name": "Honda",
        "slug": "honda",
        "logoUrl": "http://localhost:5000/uploads/brands/honda-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 18
      },
      {
        "id": 5,
        "name": "Maruti Suzuki",
        "slug": "maruti-suzuki",
        "logoUrl": "http://localhost:5000/uploads/brands/maruti-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 32
      },
      {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota",
        "logoUrl": "http://localhost:5000/uploads/brands/toyota-logo.png",
        "isPopular": true,
        "isFeatured": true,
        "totalModels": 25
      }
    ]
  }
}
```

**Note:** 
- `featured` array contains only brands with `isFeatured: true`, sorted by `displayOrder` then name
- `all` array contains all brands in alphabetical order by name

---

### 2. Get Car Models by Brand

Get list of all models for a specific brand.

**Endpoint:** `GET /api/public/car-models`

**Query Parameters:**
- `brandId` (required) - Brand ID
- `search` (optional) - Search by model name

**Example:** `GET /api/public/car-models?brandId=1`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car models retrieved successfully",
  "data": [
    {
      "id": 10,
      "brandId": 1,
      "name": "Camry",
      "slug": "toyota-camry",
      "launchYear": 2002,
      "isDiscontinued": false,
      "totalVariants": 8,
      "brand": {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota"
      }
    },
    {
      "id": 11,
      "brandId": 1,
      "name": "Fortuner",
      "slug": "toyota-fortuner",
      "launchYear": 2009,
      "isDiscontinued": false,
      "totalVariants": 12,
      "brand": {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota"
      }
    }
  ]
}
```

---

### 3. Get Car Variants by Model

Get list of all variants for a specific model.

**Endpoint:** `GET /api/public/car-variants`

**Query Parameters:**
- `modelId` (required) - Model ID
- `search` (optional) - Search by variant name

**Example:** `GET /api/public/car-variants?modelId=10`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car variants retrieved successfully",
  "data": [
    {
      "id": 45,
      "brandId": 1,
      "modelId": 10,
      "variantName": "2.5L V6 Automatic",
      "slug": "toyota-camry-2-5l-v6-automatic",
      "fuelType": "petrol",
      "transmissionType": "automatic",
      "exShowroomPrice": "4200000.00",
      "brand": {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota"
      },
      "model": {
        "id": 10,
        "name": "Camry",
        "slug": "toyota-camry"
      }
    },
    {
      "id": 46,
      "brandId": 1,
      "modelId": 10,
      "variantName": "Hybrid",
      "slug": "toyota-camry-hybrid",
      "fuelType": "hybrid",
      "transmissionType": "automatic",
      "exShowroomPrice": "4800000.00",
      "brand": {
        "id": 1,
        "name": "Toyota",
        "slug": "toyota"
      },
      "model": {
        "id": 10,
        "name": "Camry",
        "slug": "toyota-camry"
      }
    }
  ]
}
```

---

### 4. Get Car Specification by Variant ID

Get detailed specifications for a specific variant.

**Endpoint:** `GET /api/public/car-specifications/:variantId`

**Example:** `GET /api/public/car-specifications/45`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car specification retrieved successfully",
  "data": {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "variant": "2.5L V6 Automatic",
    "variantId": 45,
    "exShowroomPrice": "42,00,000",
    "displacementCc": "2494",
    "cylinderCount": 4,
    "valvesPerCylinder": 4,
    "maxPower": "178 bhp @ 6000 rpm",
    "maxTorque": "221 Nm @ 4100 rpm",
    "transmissionType": "Automatic",
    "gearCount": 6,
    "fuelType": "Petrol",
    "fuelTankCapacity": "60 litres",
    "mileageArai": "14.5 kmpl",
    "lengthMm": "4885",
    "widthMm": "1840",
    "heightMm": "1455",
    "wheelBase": "2825",
    "groundClearance": "170",
    "kerbWeight": "1590",
    "seatingCapacity": 5,
    "doorCount": 4,
    "frontSuspensionType": "MacPherson Strut",
    "rearSuspensionType": "Double Wishbone",
    "frontBrakeType": "Disc",
    "rearBrakeType": "Disc",
    "frontTyreSize": "215/55 R17",
    "rearTyreSize": "215/55 R17",
    "bodyType": "Sedan"
  }
}
```

---

## Panel Endpoints (Admin)

### 1. Get All Car Brands (Admin)

Get flat list of all car brands with all statuses (active + inactive) for admin management.

**Endpoint:** `GET /api/panel/car-brands`

**Authentication:** Required (Admin)

**Query Parameters:**
- `isActive` (optional) - Filter by active status: `true` or `false`
- `isPopular` (optional) - Filter by popular status: `true` or `false`
- `isFeatured` (optional) - Filter by featured status: `true` or `false`
- `search` (optional) - Search by brand name, slug, or local name

**Examples:**
```
GET /api/panel/car-brands                          # All brands
GET /api/panel/car-brands?isActive=true            # Active brands only
GET /api/panel/car-brands?isActive=false           # Inactive brands only
GET /api/panel/car-brands?isPopular=true           # Popular brands only
GET /api/panel/car-brands?search=toyota            # Search by name
GET /api/panel/car-brands?isActive=true&search=bmw # Active brands matching "bmw"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car brands retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Toyota",
      "slug": "toyota",
      "nameLocal": "टोयोटा",
      "logoUrl": "http://localhost:5000/uploads/brands/toyota-logo.png",
      "description": "Japanese automotive manufacturer",
      "countryOfOrigin": "Japan",
      "displayOrder": 1,
      "isPopular": true,
      "isActive": true,
      "isFeatured": true,
      "totalModels": 25,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-11-20T14:22:00.000Z"
    },
    {
      "id": 8,
      "name": "Audi",
      "slug": "audi",
      "nameLocal": "ऑडी",
      "logoUrl": "http://localhost:5000/uploads/brands/audi-logo.png",
      "description": "German luxury vehicle manufacturer",
      "countryOfOrigin": "Germany",
      "displayOrder": 5,
      "isPopular": false,
      "isActive": false,
      "isFeatured": false,
      "totalModels": 12,
      "createdAt": "2024-02-10T08:15:00.000Z",
      "updatedAt": "2024-11-18T09:45:00.000Z"
    }
  ]
}
```

**Key Differences from Public Endpoint:**
- Returns **flat array** (not grouped by featured/all)
- Includes **inactive brands** (unless filtered)
- Shows **all fields** (description, countryOfOrigin, displayOrder, timestamps)
- Supports **isActive filter** to view inactive brands
- Ordered by `displayOrder` then `name`

---

### 2. Create Car Brand

Create a new car brand.

**Endpoint:** `POST /api/panel/car-brands`

**Request Body:**
```json
{
  "name": "Tesla",
  "slug": "tesla",
  "nameLocal": "टेस्ला",
  "logoUrl": "http://localhost:5000/uploads/brands/tesla-logo.png",
  "description": "American electric vehicle manufacturer",
  "countryOfOrigin": "USA",
  "displayOrder": 1,
  "isPopular": true,
  "isActive": true,
  "isFeatured": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Car brand created successfully",
  "data": {
    "id": 50,
    "name": "Tesla",
    "slug": "tesla",
    "isActive": true,
    "createdAt": "2024-11-23T10:30:00.000Z"
  }
}
```

---

### 2. Update Car Brand

Update an existing car brand.

**Endpoint:** `PUT /api/panel/car-brands/:id`

**Request Body:**
```json
{
  "name": "Tesla Motors",
  "isPopular": true,
  "displayOrder": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car brand updated successfully",
  "data": {
    "id": 50,
    "name": "Tesla Motors",
    "slug": "tesla",
    "isPopular": true,
    "updatedAt": "2024-11-23T11:00:00.000Z"
  }
}
```

---

### 3. Delete Car Brand

Soft delete a car brand (cascades to models and variants).

**Endpoint:** `DELETE /api/panel/car-brands/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car brand deleted successfully",
  "data": null
}
```

---

### 4. Create Car Model

Create a new car model.

**Endpoint:** `POST /api/panel/car-models`

**Request Body:**
```json
{
  "brandId": 50,
  "name": "Model 3",
  "slug": "tesla-model-3",
  "isActive": true,
  "isDiscontinued": false,
  "launchYear": 2017
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Car model created successfully",
  "data": {
    "id": 100,
    "brandId": 50,
    "name": "Model 3",
    "slug": "tesla-model-3",
    "launchYear": 2017,
    "createdAt": "2024-11-23T10:30:00.000Z"
  }
}
```

---

### 5. Create Car Variant

Create a new car variant.

**Endpoint:** `POST /api/panel/car-variants`

**Request Body:**
```json
{
  "brandId": 50,
  "modelId": 100,
  "variantName": "Long Range AWD",
  "slug": "tesla-model-3-long-range-awd",
  "fullName": "Tesla Model 3 Long Range AWD",
  "modelYear": 2024,
  "bodyType": "Sedan",
  "fuelType": "Electric",
  "transmissionType": "Automatic",
  "seatingCapacity": 5,
  "doorCount": 4,
  "exShowroomPrice": 5500000,
  "isActive": true,
  "isDiscontinued": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Car variant created successfully",
  "data": {
    "id": 200,
    "brandId": 50,
    "modelId": 100,
    "variantName": "Long Range AWD",
    "slug": "tesla-model-3-long-range-awd",
    "exShowroomPrice": "5500000.00",
    "createdAt": "2024-11-23T10:30:00.000Z"
  }
}
```

---

## Use Case: Cascading Dropdowns

When creating a car listing, use these endpoints to populate cascading dropdowns:

**Step 1: Load Brands**
```javascript
GET /api/public/car-brands
// Response has two sections:
// - featured: [Toyota, Honda, Maruti Suzuki]
// - all: [Audi, BMW, Honda, Maruti Suzuki, Toyota] (alphabetical)
// User selects: Toyota (id: 1)
```

**Step 2: Load Models for Selected Brand**
```javascript
GET /api/public/car-models?brandId=1
// User selects: Camry (id: 10)
```

**Step 3: Load Variants for Selected Model**
```javascript
GET /api/public/car-variants?modelId=10
// User selects: 2.5L V6 Automatic (id: 45)
```

**Step 4: (Optional) Load Specifications**
```javascript
GET /api/public/car-specifications/45
// Display detailed specs to user
```

---

## Error Responses

**Missing Required Parameter:**
```json
{
  "success": false,
  "message": "Brand ID is required"
}
```

**Not Found:**
```json
{
  "success": false,
  "message": "Car brand not found"
}
```

**Duplicate Slug:**
```json
{
  "success": false,
  "message": "Brand slug already exists"
}
```

---

## Notes

1. **Public endpoints** - No authentication required, only return active items
2. **Panel endpoints** - Require admin authentication
3. **Soft delete** - Deleting a brand cascades to models and variants
4. **Slug uniqueness** - Slugs must be unique across the system
5. **Popular brands** - Can be filtered for quick access
6. **Specifications** - Detailed technical data for each variant

---

**Last Updated:** November 23, 2024
