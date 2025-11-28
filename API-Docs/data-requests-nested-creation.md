# Data Requests - Nested Creation Guide

Complete guide for submitting and approving car data requests with nested entity creation.

---

## Table of Contents
1. [End-User: Submit Request](#end-user-submit-request)
2. [Admin: Approve with Nested Creation](#admin-approve-with-nested-creation)
3. [Complete Workflow Examples](#complete-workflow-examples)

---

## End-User: Submit Request

### Submit Car Data Request

**Endpoint:** `POST /api/end-user/data-requests`

**Method:** `POST`

**Authentication:** Required (JWT - any authenticated user)

**Request Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

### Request Payload Examples

#### 1. Request Brand (with optional model and variant info)

```json
{
  "requestType": "brand",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Long Range AWD",
  "additionalDetails": "Electric sedan with dual motor, 358 miles range"
}
```

**Note:** When requesting a brand, you can optionally include `modelName` and `variantName`. The admin can then create all three entities when approving.

#### 2. Request Model (with optional variant info)

```json
{
  "requestType": "model",
  "brandName": "Tesla",
  "modelName": "Model S",
  "variantName": "Plaid",
  "additionalDetails": "High-performance variant with tri-motor setup"
}
```

#### 3. Request Variant Only

```json
{
  "requestType": "variant",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Performance",
  "additionalDetails": "Performance variant with track mode"
}
```

#### 4. Request State

```json
{
  "requestType": "state",
  "stateName": "Goa",
  "additionalDetails": "Tourist destination state"
}
```

#### 5. Request City

```json
{
  "requestType": "city",
  "stateName": "Goa",
  "cityName": "Panaji",
  "additionalDetails": "Capital city of Goa"
}
```

### Response Payload (Success - 200)

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
    "stateName": null,
    "cityName": null,
    "additionalDetails": "Electric sedan with dual motor, 358 miles range",
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

### Error Responses

- `400`: Invalid request type, missing required fields, or duplicate pending request
- `401`: Unauthorized (no token or invalid token)

---

## Admin: Approve with Nested Creation

### Approve Data Request

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

### Nested Creation Patterns

#### Pattern 1: Brand → Model → Variant (Full Nesting)

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

**What Gets Created:**
1. ✅ Brand: Tesla
2. ✅ Model: Model 3 (under Tesla)
3. ✅ Variant: Long Range AWD (under Model 3)

**Response Payload:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewedBy": 456,
    "reviewedAt": "2025-03-30T12:00:00.000Z",
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

#### Pattern 2: Brand → Model (Partial Nesting)

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

**What Gets Created:**
1. ✅ Brand: BMW
2. ✅ Model: 3 Series (under BMW)

---

#### Pattern 3: Model → Variant

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

**What Gets Created:**
1. ✅ Brand: Tesla (auto-created if doesn't exist)
2. ✅ Model: Model S
3. ✅ Variant: Plaid (under Model S)

---

#### Pattern 4: Brand Only (No Nesting)

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

**What Gets Created:**
1. ✅ Brand: Audi only

---

## Complete Workflow Examples

### Example 1: User Requests Brand, Admin Creates All Three

**Step 1: User Submits Request**

```bash
POST /api/end-user/data-requests
```

```json
{
  "requestType": "brand",
  "brandName": "Tesla",
  "modelName": "Model 3",
  "variantName": "Long Range AWD",
  "additionalDetails": "Electric sedan with dual motor"
}
```

**User receives:**
```json
{
  "success": true,
  "message": "Data request submitted successfully",
  "data": {
    "id": 1,
    "status": "pending"
  }
}
```

---

**Step 2: Admin Reviews and Approves**

```bash
PATCH /api/panel/data-requests/approve/1
```

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

**Admin receives:**
```json
{
  "success": true,
  "message": "Request approved and data created successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "createdBrandId": 10,
    "createdModelId": 25,
    "createdVariantId": 150
  }
}
```

---

**Step 3: User Checks Status**

```bash
GET /api/end-user/data-requests/1
```

**User receives:**
```json
{
  "success": true,
  "message": "Request retrieved successfully",
  "data": {
    "id": 1,
    "status": "approved",
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

**Result:** User sees that Tesla brand, Model 3, and Long Range AWD variant are now available on the website!

---

### Example 2: User Requests Model, Admin Creates Model + Variant

**Step 1: User Submits Request**

```bash
POST /api/end-user/data-requests
```

```json
{
  "requestType": "model",
  "brandName": "Tesla",
  "modelName": "Model S",
  "variantName": "Plaid",
  "additionalDetails": "High-performance variant"
}
```

---

**Step 2: Admin Approves with Variant**

```bash
PATCH /api/panel/data-requests/approve/2
```

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

**Result:** Model S and Plaid variant created under existing Tesla brand.

---

## Field Reference

### Brand Fields (createData)
- `name` (required): Brand name
- `nameLocal` (optional): Localized name
- `description` (optional): Brand description
- `countryOfOrigin` (optional): Country of origin
- `model` (optional): Nested model object

### Model Fields (createData.model)
- `name` (required): Model name
- `launchYear` (optional): Year launched
- `variant` (optional): Nested variant object

### Variant Fields (createData.model.variant or createData.variant)
- `variantName` (required): Variant name
- `modelYear` (optional): Model year
- `bodyType` (optional): sedan, suv, hatchback, coupe, convertible, wagon, pickup, van, truck
- `fuelType` (optional): petrol, diesel, cng, lpg, electric, hybrid
- `transmissionType` (optional): manual, automatic, cvt, semi-automatic
- `seatingCapacity` (optional): Number of seats

---

## Benefits

1. **Efficiency**: Create multiple related entities in one operation
2. **User Experience**: Users provide complete information upfront
3. **Data Consistency**: All entities created in a single transaction
4. **Flexibility**: Optional nesting - create as much or as little as needed
5. **Admin Convenience**: Less back-and-forth for related data

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

## Notes

1. **Optional Feature**: Nesting is completely optional - you can still create entities individually
2. **Validation**: All nested data is validated before creation
3. **Slugs**: Auto-generated for all entities
4. **Audit Trail**: All entities track who created them (reviewerId)
5. **Response**: Returns all created entity IDs and details
6. **User Visibility**: Once approved, data immediately appears on the website
