# Data Requests - Nested Creation Feature

## Overview

When approving car data requests, admins can create multiple related entities in a single approval operation. This allows for efficient data entry when users request a brand but also provide model and variant information.

---

## API Endpoint

### Approve Data Request with Nested Creation

**Endpoint:** `/api/panel/data-requests/approve/:id`

**Method:** `PATCH`

**Authentication:** Required (JWT + super_admin role)

**URL Parameters:**
- `id` (required): The data request ID to approve

**Request Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Payload (Brand with Model and Variant):**
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA",
    "model": {
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
}
```

**Response Payload (Success - 200):**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "brand",
    "brandName": "Tesla",
    "modelName": "Model 3",
    "variantName": "Long Range AWD",
    "status": "approved",
    "reviewedBy": 456,
    "reviewedAt": "2025-03-30T12:00:00.000Z",
    "createdBrandId": 10,
    "createdModelId": 25,
    "createdVariantId": 150,
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
    }
  }
}
```

**Error Responses:**
- `400`: Missing createData, request already processed, or validation error
- `401`: Unauthorized (missing or invalid token)
- `403`: Insufficient permissions (not super_admin)
- `404`: Request not found

---

## Feature: Nested Entity Creation

### 1. Brand Request with Model and Variant

When approving a **brand request**, you can optionally include model and variant data to create all three entities at once.

**Request Structure:**
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA",
    "model": {
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
}
```

**What Gets Created:**
1. ✅ Brand: Tesla
2. ✅ Model: Model 3 (under Tesla)
3. ✅ Variant: Long Range AWD (under Model 3)

**Response:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "requestType": "brand",
    "status": "approved",
    "createdBrandId": 10,
    "createdModelId": 25,
    "createdVariantId": 150,
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
    }
  }
}
```

---

### 2. Brand Request with Model Only

You can also create just the brand and model without the variant.

**Request Structure:**
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA",
    "model": {
      "name": "Model 3",
      "launchYear": 2017
    }
  }
}
```

**What Gets Created:**
1. ✅ Brand: Tesla
2. ✅ Model: Model 3 (under Tesla)

---

### 3. Model Request with Variant

When approving a **model request**, you can optionally include variant data.

**Request Structure:**
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

**What Gets Created:**
1. ✅ Brand: Tesla (auto-created if doesn't exist)
2. ✅ Model: Model 3
3. ✅ Variant: Long Range AWD (under Model 3)

---

## Complete Examples

### Example 1: Full Nested Creation (Brand → Model → Variant)

**Step 1: User Request**

**Endpoint:** `POST /api/end-user/data-requests`

**Request Payload:**
```json
{
  "requestType": "brand",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Long Range AWD",
  "additionalDetails": "Electric sedan with dual motor"
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Data request submitted successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "requestType": "brand",
    "brandName": "Tesla",
    "modelName": "Model 3",
    "variantName": "Long Range AWD",
    "status": "pending",
    "createdAt": "2025-03-30T10:00:00.000Z"
  }
}
```

**Step 2: Admin Approval**

**Endpoint:** `PATCH /api/panel/data-requests/approve/1`

**Request Payload:**
```json
{
  "createData": {
    "name": "Tesla",
    "nameLocal": "टेस्ला",
    "description": "American electric vehicle manufacturer",
    "countryOfOrigin": "USA",
    "model": {
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
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "createdBrandId": 10,
    "createdModelId": 25,
    "createdVariantId": 150,
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
    }
  }
}
```

**Result:** Creates Tesla brand, Model 3, and Long Range AWD variant in one operation.

---

### Example 2: Brand with Model Only

**Endpoint:** `PATCH /api/panel/data-requests/approve/2`

**Method:** `PATCH`

**Request Payload:**
```json
{
  "createData": {
    "name": "BMW",
    "nameLocal": "बीएमडब्ल्यू",
    "description": "German luxury vehicle manufacturer",
    "countryOfOrigin": "Germany",
    "model": {
      "name": "3 Series",
      "launchYear": 1975
    }
  }
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 2,
    "status": "approved",
    "createdBrandId": 11,
    "createdModelId": 26,
    "createdVariantId": null,
    "createdBrand": {
      "id": 11,
      "name": "BMW",
      "slug": "bmw"
    },
    "createdModel": {
      "id": 26,
      "name": "3 Series",
      "slug": "bmw-3-series"
    }
  }
}
```

**Result:** Creates BMW brand and 3 Series model.

---

### Example 3: Model with Variant

**Endpoint:** `PATCH /api/panel/data-requests/approve/3`

**Method:** `PATCH`

**Request Payload:**
```json
{
  "createData": {
    "name": "Model S",
    "launchYear": 2012,
    "variant": {
      "variantName": "Plaid",
      "modelYear": 2024,
      "bodyType": "sedan",
      "fuelType": "electric",
      "transmissionType": "automatic",
      "seatingCapacity": 5
    }
  }
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 3,
    "status": "approved",
    "createdBrandId": 10,
    "createdModelId": 27,
    "createdVariantId": 151,
    "createdBrand": {
      "id": 10,
      "name": "Tesla",
      "slug": "tesla"
    },
    "createdModel": {
      "id": 27,
      "name": "Model S",
      "slug": "tesla-model-s"
    },
    "createdVariant": {
      "id": 151,
      "variantName": "Plaid",
      "slug": "tesla-model-s-plaid"
    }
  }
}
```

**Result:** Creates Model S (under existing Tesla brand) and Plaid variant.

---

### Example 4: Brand Only (No Nested Data)

**Endpoint:** `PATCH /api/panel/data-requests/approve/4`

**Method:** `PATCH`

**Request Payload:**
```json
{
  "createData": {
    "name": "Audi",
    "nameLocal": "ऑडी",
    "description": "German automobile manufacturer",
    "countryOfOrigin": "Germany"
  }
}
```

**Response Payload:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 4,
    "status": "approved",
    "createdBrandId": 12,
    "createdModelId": null,
    "createdVariantId": null,
    "createdBrand": {
      "id": 12,
      "name": "Audi",
      "slug": "audi"
    }
  }
}
```

**Result:** Creates only Audi brand.

---

## Benefits

1. **Efficiency**: Create multiple related entities in one operation
2. **Data Consistency**: All entities created in a single transaction
3. **Flexibility**: Optional nesting - create as much or as little as needed
4. **User Experience**: Users can provide complete information upfront
5. **Admin Convenience**: Less back-and-forth for related data

---

## Field Reference

### Brand Fields
- `name` (required): Brand name
- `nameLocal` (optional): Localized name
- `description` (optional): Brand description
- `countryOfOrigin` (optional): Country of origin
- `model` (optional): Nested model object

### Model Fields (within `model` object)
- `name` (required): Model name
- `launchYear` (optional): Year launched
- `variant` (optional): Nested variant object

### Variant Fields (within `model.variant` object)
- `variantName` (required): Variant name
- `modelYear` (optional): Model year
- `bodyType` (optional): sedan, suv, hatchback, etc.
- `fuelType` (optional): petrol, diesel, electric, hybrid, etc.
- `transmissionType` (optional): manual, automatic, cvt, etc.
- `seatingCapacity` (optional): Number of seats

---

## Transaction Safety

All nested creations happen within a database transaction:
- ✅ If any creation fails, all changes are rolled back
- ✅ Ensures data consistency
- ✅ No partial data in case of errors

---

## Auto-Creation of Parent Entities

When approving model or variant requests:
- If the parent brand doesn't exist, it's automatically created
- If the parent model doesn't exist (for variant requests), it's automatically created
- This ensures data integrity and reduces manual work

---

## Frontend Integration Example

```javascript
// Approve brand request with full nested data
const approveBrandWithNesting = async (requestId) => {
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
          countryOfOrigin: 'USA',
          model: {
            name: 'Model 3',
            launchYear: 2017,
            variant: {
              variantName: 'Long Range AWD',
              modelYear: 2024,
              bodyType: 'sedan',
              fuelType: 'electric',
              transmissionType: 'automatic',
              seatingCapacity: 5
            }
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Created brand:', data.data.createdBrand);
      console.log('Created model:', data.data.createdModel);
      console.log('Created variant:', data.data.createdVariant);
      alert('Brand, model, and variant created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Notes

1. **Optional Feature**: Nesting is completely optional - you can still create entities individually
2. **Validation**: All nested data is validated before creation
3. **Slugs**: Auto-generated for all entities
4. **Audit Trail**: All entities track who created them (reviewerId)
5. **Response**: Returns all created entity IDs and details
