# Subscription Plans API Documentation

Complete API documentation for subscription plan management with category-based support.

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
2. [Super Admin - Plan Management](#super-admin---plan-management)
3. [Data Models](#data-models)
4. [Error Codes](#error-codes)

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Public Endpoints

### Get Available Plans
**GET** `/api/public/subscription-plans`

Get all active and public subscription plans.

**Query Parameters:**
- None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "planCode": "cars-basic",
      "version": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "categoryId": 1,
      "finalPrice": "299.00",
      "currency": "INR",
      "durationDays": 30,
      "maxTotalListings": 5,
      "isFreePlan": false,
      "isQuotaBased": true,
      "sortOrder": 1
    }
  ]
}
```

---

### Get Plans by Category
**GET** `/api/public/subscription-plans/category/:categoryId`

Get subscription plans for a specific category.

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Cars Basic Plan",
      "slug": "cars-basic",
      "planCode": "cars-basic",
      "categoryId": 1,
      "finalPrice": "299.00",
      "maxTotalListings": 5,
      "featuredDays": 7,
      "features": {
        "autoApproval": true,
        "prioritySupport": false
      }
    }
  ]
}
```

---

### Get Plan Details
**GET** `/api/public/subscription-plans/:id`

Get detailed information about a specific plan.

**Path Parameters:**
- `id` (integer, required): Plan ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 1,
    "planCode": "cars-basic",
    "version": 1,
    "name": "Cars Basic Plan",
    "slug": "cars-basic",
    "description": "Perfect for individual car sellers",
    "categoryId": 1,
    "finalPrice": "299.00",
    "currency": "INR",
    "durationDays": 30,
    "maxTotalListings": 5,
    "listingDurationDays": 30,
    "features": {
      "autoApproval": true,
      "prioritySupport": false,
      "showPhoneNumber": true,
      "allowChat": true
    },
    "termsAndConditions": "Terms apply"
  }
}
```

---

## Super Admin - Plan Management

### 1. Create Subscription Plan

Create a new subscription plan.

**Endpoint:** `POST /api/panel/subscription-plans`

**Authentication:** Required (Super Admin only)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planCode": "cars-premium",
  "name": "Cars Premium Plan",
  "slug": "cars-premium",
  "description": "Full-featured premium plan for car sellers",
  "shortDescription": "Best value for serious car sellers",
  "categoryId": 1,
  "basePrice": 999.00,
  "discountAmount": 200.00,
  "finalPrice": 799.00,
  "currency": "INR",
  "billingCycle": "monthly",
  "durationDays": 30,
  "tagline": "Most Popular",
  "showOriginalPrice": true,
  "showOfferBadge": true,
  "offerBadgeText": "20% OFF",
  "sortOrder": 2,
  "maxTotalListings": 50,
  "maxActiveListings": 10,
  "listingQuotaLimit": 10,
  "listingQuotaRollingDays": 30,
  "maxFeaturedListings": 5,
  "maxBoostedListings": 3,
  "maxSpotlightListings": 1,
  "maxHomepageListings": 1,
  "featuredDays": 7,
  "boostedDays": 3,
  "spotlightDays": 1,
  "priorityScore": 80,
  "searchBoostMultiplier": 1.5,
  "recommendationBoostMultiplier": 1.3,
  "crossCityVisibility": true,
  "nationalVisibility": false,
  "autoRenewal": true,
  "maxRenewals": 12,
  "listingDurationDays": 45,
  "autoRefreshEnabled": true,
  "refreshFrequencyDays": 7,
  "manualRefreshPerCycle": 5,
  "supportLevel": "priority",
  "isFreePlan": false,
  "isQuotaBased": true,
  "features": {
    "showPhoneNumber": true,
    "showWhatsapp": true,
    "allowChat": true,
    "priorityChatSupport": true,
    "analyticsEnabled": true,
    "viewCountVisible": true,
    "trackLeads": true,
    "sellerVerificationIncluded": true,
    "trustBadge": true,
    "warrantyBadge": false,
    "geoTargetingEnabled": true,
    "radiusTargetingKm": 50,
    "socialSharingEnabled": true,
    "createPromotions": true,
    "autoApproval": false,
    "priorityModeration": true,
    "appealRejectedListings": true
  },
  "availableAddons": [],
  "upsellSuggestions": {},
  "metadata": {},
  "internalNotes": "Premium plan for power users",
  "termsAndConditions": "Terms apply",
  "isActive": true,
  "isPublic": true,
  "isDefault": false,
  "isFeatured": true,
  "isSystemPlan": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": 3,
    "planCode": "cars-premium",
    "version": 1,
    "name": "Cars Premium Plan",
    "slug": "cars-premium",
    "categoryId": 1,
    "finalPrice": "799.00",
    "isActive": true,
    "isPublic": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing required fields, invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not super admin)

---

### 2. Update Subscription Plan

Update a subscription plan. Automatically creates new version if critical fields are changed.

**Endpoint:** `PUT /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Auto-Versioning Logic:**
- If **critical fields** changed → Creates new version automatically
- If **non-critical fields** changed → Updates in place

**Critical Fields (20 total):**
- Pricing: `basePrice`, `discountAmount`, `finalPrice`, `billingCycle`, `durationDays`
- Quotas: `maxTotalListings`, `maxActiveListings`, `listingQuotaLimit`, `listingQuotaRollingDays`
- Featured: `maxFeaturedListings`, `maxBoostedListings`, `maxSpotlightListings`, `maxHomepageListings`, `featuredDays`, `boostedDays`, `spotlightDays`
- Management: `listingDurationDays`, `autoRenewal`, `maxRenewals`, `supportLevel`

**Request Body (Example - Price Change - Critical Field):**
```json
{
  "finalPrice": 899.00,
  "basePrice": 1099.00,
  "discountAmount": 200.00
}
```

**Success Response - New Version Created (200):**
```json
{
  "success": true,
  "message": "New plan version 2 created successfully",
  "data": {
    "id": 4,
    "planCode": "cars-premium",
    "version": 2,
    "slug": "cars-premium-v2",
    "finalPrice": "899.00",
    "isActive": true,
    "isPublic": true,
    "deprecatedAt": null,
    "replacedByPlanId": null
  }
}
```

**Request Body (Example - Non-Critical Fields):**
```json
{
  "name": "Cars Premium Plan - Updated",
  "description": "Updated description",
  "tagline": "Best Value"
}
```

**Success Response - Updated In Place (200):**
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "id": 3,
    "planCode": "cars-premium",
    "version": 1,
    "slug": "cars-premium",
    "name": "Cars Premium Plan - Updated",
    "description": "Updated description"
  }
}
```

---

### 3. Get All Plans

Get all subscription plans (including deprecated versions).

**Endpoint:** `GET /api/panel/subscription-plans`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `isActive` (optional) - Filter by active status (`true`/`false`)
- `isPublic` (optional) - Filter by public visibility (`true`/`false`)
- `planCode` (optional) - Filter by plan code
- `categoryId` (optional) - Filter by category ID

**Example Request:**
```
GET /api/panel/subscription-plans?isActive=true&categoryId=1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 4,
      "planCode": "cars-premium",
      "version": 2,
      "name": "Cars Premium Plan",
      "slug": "cars-premium-v2",
      "categoryId": 1,
      "finalPrice": "899.00",
      "isActive": true,
      "isPublic": true,
      "deprecatedAt": null,
      "replacedByPlanId": null,
      "replacementPlan": null
    },
    {
      "id": 3,
      "planCode": "cars-premium",
      "version": 1,
      "name": "Cars Premium Plan",
      "slug": "cars-premium",
      "categoryId": 1,
      "finalPrice": "799.00",
      "isActive": true,
      "isPublic": false,
      "deprecatedAt": "2025-01-15T11:00:00.000Z",
      "replacedByPlanId": 4,
      "replacementPlan": {
        "id": 4,
        "name": "Cars Premium Plan",
        "slug": "cars-premium-v2",
        "finalPrice": "899.00",
        "version": 2
      }
    }
  ]
}
```

---

### 4. Get Plan by ID

Get detailed information about a specific plan.

**Endpoint:** `GET /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 3,
    "planCode": "cars-premium",
    "version": 1,
    "name": "Cars Premium Plan",
    "slug": "cars-premium",
    "description": "Full-featured premium plan for car sellers",
    "categoryId": 1,
    "basePrice": "999.00",
    "discountAmount": "200.00",
    "finalPrice": "799.00",
    "currency": "INR",
    "billingCycle": "monthly",
    "durationDays": 30,
    "maxTotalListings": 50,
    "maxActiveListings": 10,
    "features": { /* ... */ },
    "isActive": true,
    "isPublic": true,
    "isFreePlan": false,
    "isQuotaBased": true,
    "deprecatedAt": null,
    "replacedByPlanId": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
- `404` - Plan not found

---

### 5. Delete Plan

Soft delete a subscription plan.

**Endpoint:** `DELETE /api/panel/subscription-plans/:id`

**Authentication:** Required (Super Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan deleted successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Cannot delete (system plan or has active subscriptions)
- `404` - Plan not found

---

### 6. Update Plan Status

Set plan active/inactive status explicitly.

**Endpoint:** `PATCH /api/panel/subscription-plans/status/:id`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan activated successfully",
  "data": {
    "id": 3,
    "planCode": "cars-premium",
    "isActive": true
  }
}
```

---

### 7. Update Plan Visibility

Set plan public/private visibility explicitly.

**Endpoint:** `PATCH /api/panel/subscription-plans/visibility/:id`

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "isPublic": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan visibility disabled successfully",
  "data": {
    "id": 3,
    "planCode": "cars-premium",
    "isPublic": false
  }
}
```

---

## Data Models

### Subscription Plan Model

```typescript
{
  id: number,
  planCode: string,           // e.g., "cars-premium"
  version: number,            // e.g., 1, 2, 3
  name: string,
  slug: string,               // e.g., "cars-premium", "cars-premium-v2"
  description: string,
  categoryId: number,         // Category this plan belongs to
  basePrice: decimal,
  discountAmount: decimal,
  finalPrice: decimal,
  currency: string,           // "INR"
  billingCycle: enum,         // "daily", "weekly", "monthly", "quarterly", "annual", "one_time"
  durationDays: number,
  maxTotalListings: number,
  maxActiveListings: number,
  listingQuotaLimit: number,
  listingQuotaRollingDays: number,
  maxFeaturedListings: number,
  maxBoostedListings: number,
  maxSpotlightListings: number,
  maxHomepageListings: number,
  featuredDays: number,
  boostedDays: number,
  spotlightDays: number,
  priorityScore: number,
  searchBoostMultiplier: decimal,
  recommendationBoostMultiplier: decimal,
  crossCityVisibility: boolean,
  nationalVisibility: boolean,
  autoRenewal: boolean,
  maxRenewals: number,
  listingDurationDays: number,
  autoRefreshEnabled: boolean,
  refreshFrequencyDays: number,
  manualRefreshPerCycle: number,
  supportLevel: enum,         // "basic", "priority", "premium"
  isFreePlan: boolean,        // true for free plans, false for paid plans
  isQuotaBased: boolean,      // true for quota-based plans, false for time-based plans
  features: json,
  availableAddons: json,
  upsellSuggestions: json,
  metadata: json,
  internalNotes: text,
  termsAndConditions: text,
  isActive: boolean,
  isPublic: boolean,
  isDefault: boolean,
  isFeatured: boolean,
  isSystemPlan: boolean,
  deprecatedAt: timestamp,
  replacedByPlanId: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, invalid data) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Plan Types

- `isFreePlan`: true for free plans, false for paid plans
- `isQuotaBased`: true for quota-based plans, false for time-based plans

---

## Notes

### Category-Based Plans

1. **Category Support**: All subscription plans are category-specific (Cars, Properties, etc.)
2. **Category Filtering**: All endpoints support filtering by categoryId
3. **Free Plans**: Each category can have a default free plan for users without paid subscriptions

### Plan Management

4. **Auto-Versioning**: When updating a plan, if any of the 20 critical fields are changed, a new version is automatically created.
5. **Auto-Generated Slugs**: 
   - On **create**: Slug auto-generated from name if not provided
   - On **update (non-critical)**: Slug remains unchanged (cannot be modified)
   - On **version creation**: Slug auto-generated as `{planCode}-v{version}` (e.g., `cars-premium-v2`)
6. **Deprecated Plans**: Old plan versions remain active but hidden (`isActive: true`, `isPublic: false`) so existing subscribers can still access their benefits.
7. **Explicit State Management**: Toggle endpoints (status, visibility) require explicit boolean values in the request body.