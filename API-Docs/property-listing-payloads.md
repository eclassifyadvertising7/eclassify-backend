# Property Listing Payloads Reference

Complete request and response payload examples for each property type.

---

## Common Fields (All Property Types)

These fields are required/applicable for ALL property listings regardless of type.

### Request (Common)
```json
{
  "categoryId": 2,
  "categoryType": "property",
  "title": "Property Title",
  "description": "Detailed description",
  "price": 5000000,
  "priceNegotiable": true,
  "stateId": 1,
  "cityId": 101,
  "locality": "Sector 15",
  "address": "Full address",
  "latitude": 28.4595,
  "longitude": 77.0266,
  "propertyType": "apartment",
  "listingType": "sale",
  "areaSqft": 1200
}
```

### Response (Common)
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "id": 123,
    "userId": 456,
    "categoryId": 2,
    "categoryType": "property",
    "title": "Property Title",
    "slug": "property-title-abc123",
    "shareCode": "K9M3P7Q",
    "description": "Detailed description",
    "price": "5000000.00",
    "priceNegotiable": true,
    "stateId": 1,
    "cityId": 101,
    "stateName": "Haryana",
    "cityName": "Gurgaon",
    "locality": "Sector 15",
    "address": "Full address",
    "latitude": "28.45950000",
    "longitude": "77.02660000",
    "status": "pending",
    "isFeatured": false,
    "expiresAt": "2025-02-01T10:30:00.000Z",
    "viewCount": 0,
    "contactCount": 0,
    "totalFavorites": 0,
    "postedByType": "owner",
    "createdAt": "2025-01-02T10:30:00.000Z",
    "updatedAt": "2025-01-02T10:30:00.000Z"
  }
}
```

---

## 1. Residential: Apartment & House

**Applicable for:** `propertyType: "apartment"` and `propertyType: "house"`

### Request Payload
```json
{
  // ... Common fields above
  "propertyType": "apartment",
  "listingType": "sale",
  "areaSqft": 1200,
  "carpetAreaSqft": 1000,
  "bedrooms": 3,
  "bathrooms": 2,
  "balconies": 2,
  "furnished": "semi-furnished",
  "floorNumber": 5,
  "totalFloors": 10,
  "ageYears": 3,
  "facing": "north",
  "parkingSpaces": 1,
  "amenities": [
    "Swimming Pool",
    "Gym",
    "Parking",
    "Security",
    "Lift",
    "Power Backup",
    "Garden",
    "Playground",
    "Club House",
    "CCTV"
  ],
  "availableFrom": "2025-02-01",
  "ownershipType": "freehold",
  "reraApproved": true,
  "reraId": "RERA123456"
}
```

### Response Payload
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    // ... Common response fields
    "propertyListing": {
      "id": 789,
      "listingId": 123,
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
      "amenities": [
        "Swimming Pool",
        "Gym",
        "Parking",
        "Security",
        "Lift",
        "Power Backup",
        "Garden",
        "Playground",
        "Club House",
        "CCTV"
      ],
      "availableFrom": "2025-02-01",
      "ownershipType": "freehold",
      "reraApproved": true,
      "reraId": "RERA123456",
      "createdAt": "2025-01-02T10:30:00.000Z",
      "updatedAt": "2025-01-02T10:30:00.000Z"
    }
  }
}
```

### Required Fields
- `areaSqft` *
- `bedrooms` *
- `bathrooms` *
- `furnished` *

### Optional Fields
- `carpetAreaSqft`, `balconies`, `floorNumber`, `totalFloors`, `ageYears`, `facing`, `parkingSpaces`, `amenities`, `availableFrom`, `ownershipType`, `reraApproved`, `reraId`

---

## 2. Commercial: Office & Shop

**Applicable for:** `propertyType: "office"` and `propertyType: "shop"`

### Request Payload
```json
{
  // ... Common fields
  "propertyType": "office",
  "listingType": "rent",
  "areaSqft": 2000,
  "carpetAreaSqft": 1800,
  "washrooms": 3,
  "furnished": "fully-furnished",
  "floorNumber": 3,
  "totalFloors": 8,
  "ageYears": 5,
  "facing": "east",
  "parkingSpaces": 4,
  "amenities": [
    "Parking",
    "Security",
    "Lift",
    "Power Backup",
    "CCTV",
    "Fire Safety",
    "Internet/Wi-Fi",
    "Air Conditioning",
    "Water Supply"
  ],
  "availableFrom": "2025-02-15",
  "ownershipType": "leasehold"
}
```

### Response Payload
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    // ... Common response fields
    "propertyListing": {
      "id": 790,
      "listingId": 124,
      "propertyType": "office",
      "listingType": "rent",
      "areaSqft": 2000,
      "carpetAreaSqft": 1800,
      "washrooms": 3,
      "furnished": "fully-furnished",
      "floorNumber": 3,
      "totalFloors": 8,
      "ageYears": 5,
      "facing": "east",
      "parkingSpaces": 4,
      "amenities": [
        "Parking",
        "Security",
        "Lift",
        "Power Backup",
        "CCTV",
        "Fire Safety",
        "Internet/Wi-Fi",
        "Air Conditioning",
        "Water Supply"
      ],
      "availableFrom": "2025-02-15",
      "ownershipType": "leasehold",
      "createdAt": "2025-01-02T10:30:00.000Z",
      "updatedAt": "2025-01-02T10:30:00.000Z"
    }
  }
}
```

### Required Fields
- `areaSqft` *
- `furnished` *

### Optional Fields
- `carpetAreaSqft`, `washrooms`, `floorNumber`, `totalFloors`, `ageYears`, `facing`, `parkingSpaces`, `amenities`, `availableFrom`, `ownershipType`

### Hidden Fields
- `bedrooms`, `balconies` (not applicable for commercial)

---

## 3. Shared Living: PG & Hostel

**Applicable for:** `propertyType: "pg"` and `propertyType: "hostel"`

### Request Payload
```json
{
  // ... Common fields
  "propertyType": "pg",
  "listingType": "rent",
  "areaSqft": 150,
  "bathrooms": 2,
  "furnished": "fully-furnished",
  "floorNumber": 2,
  "totalFloors": 4,
  "ageYears": 2,
  "foodIncluded": "optional",
  "genderPreference": "male",
  "amenities": [
    "Wi-Fi",
    "Power Backup",
    "Security",
    "Laundry",
    "Common Kitchen",
    "TV/Entertainment",
    "CCTV",
    "Water Supply"
  ],
  "availableFrom": "2025-01-15"
}
```

### Response Payload
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    // ... Common response fields
    "propertyListing": {
      "id": 791,
      "listingId": 125,
      "propertyType": "pg",
      "listingType": "rent",
      "areaSqft": 150,
      "bathrooms": 2,
      "furnished": "fully-furnished",
      "floorNumber": 2,
      "totalFloors": 4,
      "ageYears": 2,
      "foodIncluded": "optional",
      "genderPreference": "male",
      "amenities": [
        "Wi-Fi",
        "Power Backup",
        "Security",
        "Laundry",
        "Common Kitchen",
        "TV/Entertainment",
        "CCTV",
        "Water Supply"
      ],
      "availableFrom": "2025-01-15",
      "createdAt": "2025-01-02T10:30:00.000Z",
      "updatedAt": "2025-01-02T10:30:00.000Z"
    }
  }
}
```

### Required Fields
- `areaSqft` *
- `bathrooms` *
- `furnished` *

### Optional Fields
- `floorNumber`, `totalFloors`, `ageYears`, `foodIncluded`, `genderPreference`, `amenities`, `availableFrom`

### Hidden Fields
- `bedrooms`, `balconies`, `carpetAreaSqft`, `facing` (not applicable for PG/Hostel)

### ENUM Values
- `foodIncluded`: "yes" | "no" | "optional"
- `genderPreference`: "male" | "female" | "any"

---

## 4. Plot

**Applicable for:** `propertyType: "plot"`

### Request Payload
```json
{
  // ... Common fields
  "propertyType": "plot",
  "listingType": "sale",
  "areaSqft": 5000,
  "plotLengthFt": 100,
  "plotWidthFt": 50,
  "facing": "north",
  "boundaryWall": true,
  "cornerPlot": true,
  "gatedCommunity": true,
  "amenities": [
    "Water Supply",
    "Electricity",
    "Drainage",
    "Street Lights",
    "Gated Security",
    "Paved Road"
  ],
  "ownershipType": "freehold",
  "reraApproved": false
}
```

### Response Payload
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    // ... Common response fields
    "propertyListing": {
      "id": 792,
      "listingId": 126,
      "propertyType": "plot",
      "listingType": "sale",
      "areaSqft": 5000,
      "plotLengthFt": "100.00",
      "plotWidthFt": "50.00",
      "facing": "north",
      "boundaryWall": true,
      "cornerPlot": true,
      "gatedCommunity": true,
      "amenities": [
        "Water Supply",
        "Electricity",
        "Drainage",
        "Street Lights",
        "Gated Security",
        "Paved Road"
      ],
      "ownershipType": "freehold",
      "reraApproved": false,
      "createdAt": "2025-01-02T10:30:00.000Z",
      "updatedAt": "2025-01-02T10:30:00.000Z"
    }
  }
}
```

### Required Fields
- `areaSqft` *

### Optional Fields
- `plotLengthFt`, `plotWidthFt`, `facing`, `boundaryWall`, `cornerPlot`, `gatedCommunity`, `amenities`, `ownershipType`, `reraApproved`, `reraId`

### Hidden Fields
- `bedrooms`, `bathrooms`, `balconies`, `furnished`, `floorNumber`, `totalFloors`, `carpetAreaSqft`, `ageYears`, `parkingSpaces` (not applicable for plot)

---

## 5. Warehouse

**Applicable for:** `propertyType: "warehouse"`

### Request Payload
```json
{
  // ... Common fields
  "propertyType": "warehouse",
  "listingType": "rent",
  "areaSqft": 10000,
  "coveredAreaSqft": 7000,
  "openAreaSqft": 3000,
  "ceilingHeightFt": 25.5,
  "loadingDocks": 4,
  "floorNumber": 0,
  "ageYears": 1,
  "parkingSpaces": 10,
  "amenities": [
    "Power Backup",
    "Security",
    "CCTV",
    "Fire Safety",
    "Parking",
    "Water Supply",
    "Drainage",
    "Office Space",
    "Loading Bay",
    "Goods Lift"
  ],
  "availableFrom": "2025-03-01",
  "ownershipType": "leasehold"
}
```

### Response Payload
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    // ... Common response fields
    "propertyListing": {
      "id": 793,
      "listingId": 127,
      "propertyType": "warehouse",
      "listingType": "rent",
      "areaSqft": 10000,
      "coveredAreaSqft": 7000,
      "openAreaSqft": 3000,
      "ceilingHeightFt": "25.50",
      "loadingDocks": 4,
      "floorNumber": 0,
      "ageYears": 1,
      "parkingSpaces": 10,
      "amenities": [
        "Power Backup",
        "Security",
        "CCTV",
        "Fire Safety",
        "Parking",
        "Water Supply",
        "Drainage",
        "Office Space",
        "Loading Bay",
        "Goods Lift"
      ],
      "availableFrom": "2025-03-01",
      "ownershipType": "leasehold",
      "createdAt": "2025-01-02T10:30:00.000Z",
      "updatedAt": "2025-01-02T10:30:00.000Z"
    }
  }
}
```

### Required Fields
- `areaSqft` *

### Optional Fields
- `coveredAreaSqft`, `openAreaSqft`, `ceilingHeightFt`, `loadingDocks`, `floorNumber`, `ageYears`, `parkingSpaces`, `amenities`, `availableFrom`, `ownershipType`

### Hidden Fields
- `bedrooms`, `bathrooms`, `balconies`, `furnished`, `facing`, `carpetAreaSqft`, `totalFloors` (not applicable for warehouse)

---

## Common ENUM Values

### propertyType
- "apartment"
- "house"
- "villa"
- "plot"
- "commercial"
- "office"
- "shop"
- "warehouse"
- "pg"
- "hostel"

### listingType
- "sale"
- "rent"
- "other"

### furnished
- "unfurnished"
- "semi-furnished"
- "fully-furnished"

### facing
- "north"
- "south"
- "east"
- "west"
- "north-east"
- "north-west"
- "south-east"
- "south-west"

### ownershipType
- "freehold"
- "leasehold"
- "co-operative"

---

## Notes

1. **Media Upload**: Images and videos are uploaded separately via multipart/form-data to the media upload endpoint
2. **Validation**: Backend validates required fields based on property type
3. **Null Values**: Optional fields can be omitted or sent as null
4. **Arrays**: Amenities should be sent as JSON array
5. **Decimals**: Price, latitude, longitude, and area measurements support decimal values
6. **Dates**: Use ISO 8601 format (YYYY-MM-DD) for date fields
7. **Boolean**: Send as true/false (not "true"/"false" strings)
