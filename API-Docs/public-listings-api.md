# Public Listings API - Frontend Integration Guide

## Overview

This document provides comprehensive documentation for the public listings API, including search, filter, and sort capabilities for browsing active listings.

## Base URL

```
/api/public/listings
```

---

## Endpoints Overview

| Endpoint | Purpose | Filters |
|----------|---------|---------|
| `GET /homepage` | Homepage listings | None (newest first) |
| `GET /category/:categorySlugOrId` | Category-specific listings | All filters available |
| `GET /featured` | Featured listings only | Limited filters |
| `GET /:slug` | Single listing details | N/A |
| `POST /view/:id` | Track listing views | N/A |

---

## Endpoints

### 1. Homepage Listings (NEW)

**Endpoint:** `GET /api/public/listings/homepage`

**Description:** Fetch listings for homepage display. Simple endpoint with no filters, sorted by newest first.

**Authentication:** Not required (public endpoint)

**Use Case:** Homepage "Latest Listings" section

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 20, max: 100) | `?limit=30` |

#### Example Requests

**Basic homepage listings:**
```
GET /api/public/listings/homepage
```

**With pagination:**
```
GET /api/public/listings/homepage?page=1&limit=30
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Listings fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Honda City VX 2020 - Excellent Condition",
      "slug": "honda-city-vx-2020-excellent-condition-a1b2c3",
      "price": "650000.00",
      "priceNegotiable": true,
      "status": "active",
      "isFeatured": true,
      "viewCount": 245,
      "createdAt": "2025-01-24T10:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 5,
        "name": "Karnataka",
        "slug": "karnataka"
      },
      "city": {
        "id": 42,
        "name": "Bangalore",
        "slug": "bangalore"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "/uploads/listings/1/image1.jpg",
          "thumbnailUrl": "/uploads/listings/1/thumb_image1.jpg",
          "mediaType": "image"
        }
      ]
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 2. Browse Category Listings (NEW - PRIMARY FILTER ENDPOINT)

**Endpoint:** `GET /api/public/listings/category/:categorySlugOrId`

**Description:** Fetch listings for a specific category with advanced search, filter, and sort capabilities. This is the main endpoint for category pages with full filtering support.

**Authentication:** Not required (public endpoint)

**Use Case:** Category pages (Cars, Properties, etc.) with filters

**Endpoint:** `GET /api/public/listings/category/:categorySlugOrId`

**Description:** Fetch listings for a specific category with advanced search, filter, and sort capabilities.

**Authentication:** Not required (public endpoint)

#### URL Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `categorySlugOrId` | string/integer | Category slug or ID | `/category/cars` or `/category/1` |

#### Query Parameters

##### Basic Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 20, max: 100) | `?limit=50` |
| `categoryId` | integer | Filter by category ID | `?categoryId=1` |
| `stateId` | integer | Filter by state ID | `?stateId=5` |
| `cityId` | integer | Filter by city ID | `?cityId=42` |
| `isFeatured` | boolean | Show only featured listings | `?isFeatured=true` |
| `search` | string | Search in title and description | `?search=honda` |

##### Price Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `minPrice` | decimal | Minimum price | `?minPrice=100000` |
| `maxPrice` | decimal | Maximum price | `?maxPrice=500000` |

##### Sort Options

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `sortBy` | string | Sort order | `?sortBy=price_asc` |

**Available Sort Values:**
- `date_desc` (default) - Newest first
- `date_asc` - Oldest first
- `price_asc` - Price low to high
- `price_desc` - Price high to low
- `views` - Most viewed first

##### Car-Specific Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `brandId` | integer | Car brand ID | `?brandId=1` |
| `modelId` | integer | Car model ID | `?modelId=5` |
| `variantId` | integer | Car variant ID | `?variantId=12` |
| `minYear` | integer | Minimum manufacturing year | `?minYear=2015` |
| `maxYear` | integer | Maximum manufacturing year | `?maxYear=2023` |
| `condition` | enum | Car condition | `?condition=used` |
| `fuelType` | enum | Fuel type | `?fuelType=petrol` |
| `transmission` | enum | Transmission type | `?transmission=automatic` |
| `bodyType` | enum | Body type | `?bodyType=suv` |
| `minMileage` | integer | Minimum mileage in km | `?minMileage=10000` |
| `maxMileage` | integer | Maximum mileage in km | `?maxMileage=50000` |
| `ownersCount` | integer | Number of previous owners | `?ownersCount=1` |

**Car Enum Values:**

- **condition:** `new`, `used`
- **fuelType:** `petrol`, `diesel`, `cng`, `lpg`, `electric`, `hybrid`
- **transmission:** `manual`, `automatic`, `cvt`, `semi-automatic`
- **bodyType:** `sedan`, `hatchback`, `suv`, `coupe`, `convertible`, `wagon`, `pickup`, `van`, `truck`

##### Property-Specific Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `propertyType` | enum | Property type | `?propertyType=apartment` |
| `listingType` | enum | Listing type (sale/rent) | `?listingType=sale` |
| `bedrooms` | integer | Number of bedrooms | `?bedrooms=3` |
| `bathrooms` | integer | Number of bathrooms | `?bathrooms=2` |
| `minArea` | integer | Minimum area in sqft | `?minArea=1000` |
| `maxArea` | integer | Maximum area in sqft | `?maxArea=2000` |
| `furnished` | enum | Furnishing status | `?furnished=fully-furnished` |
| `facing` | enum | Property facing direction | `?facing=north` |
| `parkingSpaces` | integer | Minimum parking spaces | `?parkingSpaces=1` |

**Property Enum Values:**

- **propertyType:** `apartment`, `house`, `villa`, `plot`, `commercial`, `office`, `shop`, `warehouse`
- **listingType:** `sale`, `rent`, `pg`, `hostel`
- **furnished:** `unfurnished`, `semi-furnished`, `fully-furnished`
- **facing:** `north`, `south`, `east`, `west`, `north-east`, `north-west`, `south-east`, `south-west`

#### Example Requests

**Basic category listings (by slug):**
```
GET /api/public/listings/category/cars?page=1&limit=20
```

**Basic category listings (by ID):**
```
GET /api/public/listings/category/1?page=1&limit=20
```

**Search within category:**
```
GET /api/public/listings/category/cars?search=honda&page=1&limit=20
```

**Filter by location:**
```
GET /api/public/listings/category/cars?stateId=5&cityId=42
```

**Car listings with filters:**
```
GET /api/public/listings/category/cars?brandId=1&fuelType=petrol&transmission=automatic&minPrice=200000&maxPrice=800000&sortBy=price_asc
```

**Property listings with filters:**
```
GET /api/public/listings/category/properties?propertyType=apartment&bedrooms=3&listingType=sale&minArea=1200&maxArea=1800&furnished=semi-furnished
```

**Featured listings in category:**
```
GET /api/public/listings/category/cars?isFeatured=true&limit=10
```

**Multiple filters combined:**
```
GET /api/public/listings/category/cars?stateId=5&brandId=1&modelId=5&minYear=2018&maxYear=2023&condition=used&fuelType=diesel&transmission=manual&minPrice=300000&maxPrice=700000&sortBy=price_asc&page=1&limit=20
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Listings fetched successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "categoryId": 1,
      "title": "Honda City VX 2020 - Excellent Condition",
      "slug": "honda-city-vx-2020-excellent-condition-a1b2c3",
      "description": "Well maintained Honda City with full service history...",
      "price": "650000.00",
      "priceNegotiable": true,
      "stateId": 5,
      "cityId": 42,
      "locality": "Koramangala",
      "status": "active",
      "isFeatured": true,
      "featuredUntil": "2025-12-31T23:59:59.000Z",
      "viewCount": 245,
      "contactCount": 12,
      "publishedAt": "2025-01-15T10:30:00.000Z",
      "expiresAt": "2025-02-14T10:30:00.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-20T15:30:00.000Z",
      "category": {
        "id": 1,
        "name": "Cars",
        "slug": "cars"
      },
      "state": {
        "id": 5,
        "name": "Karnataka",
        "slug": "karnataka"
      },
      "city": {
        "id": 42,
        "name": "Bangalore",
        "slug": "bangalore"
      },
      "media": [
        {
          "id": 1,
          "mediaUrl": "/uploads/listings/1/image1.jpg",
          "thumbnailUrl": "/uploads/listings/1/thumb_image1.jpg",
          "mediaType": "image"
        }
      ],
      "carListing": {
        "id": 1,
        "listingId": 1,
        "brandId": 1,
        "modelId": 5,
        "variantId": 12,
        "year": 2020,
        "registrationYear": 2020,
        "condition": "used",
        "mileageKm": 25000,
        "ownersCount": 1,
        "fuelType": "petrol",
        "transmission": "manual",
        "bodyType": "sedan",
        "color": "White",
        "seats": 5,
        "brand": {
          "id": 1,
          "name": "Honda",
          "slug": "honda"
        },
        "model": {
          "id": 5,
          "name": "City",
          "slug": "city"
        },
        "variant": {
          "id": 12,
          "name": "VX CVT"
        }
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Error Responses:**

**400 Bad Request (Invalid Parameters):**
```json
{
  "success": false,
  "message": "Invalid category ID"
}
```

**400 Bad Request (Inactive Category):**
```json
{
  "success": false,
  "message": "Category is not active"
}
```

**404 Not Found (Category Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 3. Get Featured Listings

**Endpoint:** `GET /api/public/listings/featured`

**Description:** Fetch only featured listings.

**Authentication:** Not required

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | integer | Number of items (default: 10) | `?limit=5` |
| `categoryId` | integer | Filter by category | `?categoryId=1` |

#### Example Request

```
GET /api/public/listings/featured?limit=10
```

#### Response Format

Same as browse endpoint, but only returns featured listings.

---

### 4. Get Listing by Slug

**Endpoint:** `GET /api/public/listings/:slug`

**Description:** Fetch detailed information about a specific listing using its slug.

**Authentication:** Not required

#### URL Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `slug` | string | Listing slug | `/honda-city-vx-2020-a1b2c3` |

#### Example Request

```
GET /api/public/listings/honda-city-vx-2020-excellent-condition-a1b2c3
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Listing fetched successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "categoryId": 1,
    "title": "Honda City VX 2020 - Excellent Condition",
    "slug": "honda-city-vx-2020-excellent-condition-a1b2c3",
    "description": "Well maintained Honda City with full service history. Single owner, all documents clear. Features include: ABS, Airbags, Power Steering, Power Windows, AC, Heater, Alloy Wheels, Multi-function Steering Wheel.",
    "price": "650000.00",
    "priceNegotiable": true,
    "stateId": 5,
    "cityId": 42,
    "locality": "Koramangala",
    "address": "Near Forum Mall, Koramangala 5th Block",
    "latitude": "12.9352",
    "longitude": "77.6245",
    "status": "active",
    "isFeatured": true,
    "featuredUntil": "2025-12-31T23:59:59.000Z",
    "viewCount": 245,
    "contactCount": 12,
    "publishedAt": "2025-01-15T10:30:00.000Z",
    "expiresAt": "2025-02-14T10:30:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T15:30:00.000Z",
    "user": {
      "id": 123,
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210"
    },
    "category": {
      "id": 1,
      "name": "Cars",
      "slug": "cars"
    },
    "state": {
      "id": 5,
      "name": "Karnataka",
      "slug": "karnataka"
    },
    "city": {
      "id": 42,
      "name": "Bangalore",
      "slug": "bangalore"
    },
    "carListing": {
      "id": 1,
      "listingId": 1,
      "brandId": 1,
      "modelId": 5,
      "variantId": 12,
      "year": 2020,
      "registrationYear": 2020,
      "condition": "used",
      "mileageKm": 25000,
      "ownersCount": 1,
      "fuelType": "petrol",
      "transmission": "manual",
      "bodyType": "sedan",
      "color": "White",
      "engineCapacityCc": 1498,
      "powerBhp": 119,
      "seats": 5,
      "registrationNumber": "KA01AB1234",
      "registrationStateId": 5,
      "insuranceValidUntil": "2025-12-31T00:00:00.000Z",
      "features": {
        "abs": true,
        "airbags": 6,
        "powerSteering": true,
        "powerWindows": true,
        "ac": true,
        "alloyWheels": true,
        "sunroof": false
      },
      "brand": {
        "id": 1,
        "name": "Honda",
        "slug": "honda"
      },
      "model": {
        "id": 5,
        "name": "City",
        "slug": "city"
      },
      "variant": {
        "id": 12,
        "name": "VX CVT"
      }
    },
    "media": [
      {
        "id": 1,
        "listingId": 1,
        "mediaType": "image",
        "mediaUrl": "/uploads/listings/1/image1.jpg",
        "thumbnailUrl": "/uploads/listings/1/thumb_image1.jpg",
        "isPrimary": true,
        "displayOrder": 1
      },
      {
        "id": 2,
        "listingId": 1,
        "mediaType": "image",
        "mediaUrl": "/uploads/listings/1/image2.jpg",
        "thumbnailUrl": "/uploads/listings/1/thumb_image2.jpg",
        "isPrimary": false,
        "displayOrder": 2
      }
    ]
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Listing not found"
}
```

---

### 5. Increment View Count

**Endpoint:** `POST /api/public/listings/view/:id`

**Description:** Increment the view count for a listing (call when user views listing details).

**Authentication:** Not required

#### URL Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | integer | Listing ID | `/view/1` |

#### Example Request

```
POST /api/public/listings/view/1
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "View count updated",
  "data": null
}
```

---

## Frontend Integration Examples

### React/Next.js Example

```javascript
// API service
const API_BASE_URL = 'http://localhost:3000/api';

export const listingsAPI = {
  // Get homepage listings (no filters)
  async getHomepage(page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(`${API_BASE_URL}/public/listings/homepage?${params}`);
    return response.json();
  },
  
  // Browse category listings with filters
  async browseCategory(categorySlugOrId, filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/public/listings/category/${categorySlugOrId}?${params}`);
    return response.json();
  },
  
  // Get featured listings
  async getFeatured(limit = 10, categoryId = null) {
    const params = new URLSearchParams({ limit });
    if (categoryId) params.append('categoryId', categoryId);
    
    const response = await fetch(`${API_BASE_URL}/public/listings/featured?${params}`);
    return response.json();
  },
  
  // Get listing by slug
  async getBySlug(slug) {
    const response = await fetch(`${API_BASE_URL}/public/listings/${slug}`);
    return response.json();
  },
  
  // Increment view count
  async incrementView(id) {
    const response = await fetch(`${API_BASE_URL}/public/listings/view/${id}`, {
      method: 'POST'
    });
    return response.json();
  }
};

// Usage in component
import { useState, useEffect } from 'react';

function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    categoryId: null,
    stateId: null,
    cityId: null,
    minPrice: null,
    maxPrice: null,
    search: '',
    sortBy: 'date_desc',
    // Car filters
    brandId: null,
    modelId: null,
    fuelType: null,
    transmission: null,
    // Property filters
    propertyType: null,
    bedrooms: null
  });
  
  useEffect(() => {
    fetchListings();
  }, [filters]);
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      const result = await listingsAPI.browse(filters);
      if (result.success) {
        setListings(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };
  
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };
  
  return (
    <div>
      {/* Filters UI */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="views">Most Viewed</option>
        </select>
        
        {/* Add more filter inputs */}
      </div>
      
      {/* Listings grid */}
      <div className="listings-grid">
        {loading ? (
          <p>Loading...</p>
        ) : (
          listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Vue.js Example

```javascript
// composables/useListings.js
import { ref, watch } from 'vue';

export function useListings() {
  const listings = ref([]);
  const pagination = ref({});
  const loading = ref(false);
  
  const filters = ref({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'date_desc'
  });
  
  const fetchListings = async () => {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      Object.keys(filters.value).forEach(key => {
        if (filters.value[key]) {
          params.append(key, filters.value[key]);
        }
      });
      
      const response = await fetch(`/api/public/listings?${params}`);
      const result = await response.json();
      
      if (result.success) {
        listings.value = result.data;
        pagination.value = result.pagination;
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      loading.value = false;
    }
  };
  
  watch(filters, fetchListings, { deep: true });
  
  return {
    listings,
    pagination,
    loading,
    filters,
    fetchListings
  };
}
```

---

## Best Practices

### 1. Pagination
- Always use pagination for listing pages
- Default limit is 20, adjust based on your UI needs
- Show total count and page numbers to users

### 2. Filtering
- Apply filters progressively (don't overwhelm users)
- Show active filters with clear remove options
- Persist filters in URL query params for shareable links

### 3. Search
- Implement debouncing for search input (wait 300-500ms after user stops typing)
- Show search suggestions if possible
- Clear search button for better UX

### 4. Performance
- Cache featured listings (they change less frequently)
- Implement infinite scroll or "Load More" for better mobile UX
- Use thumbnail URLs for listing cards, full images for detail pages

### 5. View Tracking
- Call increment view endpoint only once per session per listing
- Use localStorage or sessionStorage to track viewed listings
- Don't increment on preview/hover

### 6. Error Handling
- Show user-friendly error messages
- Implement retry logic for failed requests
- Handle empty states gracefully

---

## Common Use Cases

### 1. Homepage Featured Listings
```javascript
const featuredListings = await listingsAPI.getFeatured(8);
```

### 2. Category Page
```javascript
const carListings = await listingsAPI.browse({
  categoryId: 1,
  page: 1,
  limit: 20,
  sortBy: 'date_desc'
});
```

### 3. Search Results
```javascript
const searchResults = await listingsAPI.browse({
  search: 'honda city',
  page: 1,
  limit: 20
});
```

### 4. Advanced Car Filter
```javascript
const filteredCars = await listingsAPI.browse({
  categoryId: 1,
  brandId: 1,
  modelId: 5,
  minYear: 2018,
  maxYear: 2023,
  fuelType: 'petrol',
  transmission: 'automatic',
  minPrice: 300000,
  maxPrice: 800000,
  stateId: 5,
  cityId: 42,
  sortBy: 'price_asc',
  page: 1,
  limit: 20
});
```

### 5. Property Listings
```javascript
const properties = await listingsAPI.browse({
  categoryId: 2,
  propertyType: 'apartment',
  listingType: 'sale',
  bedrooms: 3,
  minArea: 1200,
  maxArea: 1800,
  furnished: 'semi-furnished',
  stateId: 5,
  cityId: 42,
  sortBy: 'price_asc'
});
```

---

## Error Handling

The API validates all input parameters and returns appropriate error messages:

### Category Validation
- **Invalid category ID:** Returns 400 with message "Invalid category ID"
- **Category not found:** Returns 404 with message "Category not found"
- **Inactive category:** Returns 400 with message "Category is not active"

### Common Error Codes
- **400 Bad Request:** Invalid parameters or inactive resources
- **404 Not Found:** Resource (listing, category) not found
- **500 Internal Server Error:** Server-side error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description here"
}
```

## Notes

- All prices are in INR (Indian Rupees)
- All areas are in square feet (sqft)
- All distances/mileage are in kilometers (km)
- Dates are in ISO 8601 format
- Only `active` listings are returned in public endpoints
- Only `active` categories are allowed in filters
- Featured listings are automatically filtered by `featuredUntil` date
- Soft-deleted listings are never returned
- Category validation happens before querying listings

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.
