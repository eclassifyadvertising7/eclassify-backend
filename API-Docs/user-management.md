# User Management API Documentation

## Overview

Admin panel API for managing users (both external users and internal staff). Provides endpoints for listing, creating, updating, and managing user accounts, KYC status, and permissions.

**Base URL**: `/api/panel/users`

**Authentication**: Required (JWT token)

**Roles**: Admin, Super Admin

---

## Endpoints

### 1. List External Users (User Role)

Get paginated list of external users with 'user' role.

**Endpoint**: `GET /api/panel/users/list/external`

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `search` (optional) - Search by name, email, or mobile (case-insensitive)
- `status` (optional) - Filter by status: `active`, `blocked`, `suspended`, `deleted`
- `startDate` (optional) - Filter users registered from this date (YYYY-MM-DD format)
- `endDate` (optional) - Filter users registered until this date (YYYY-MM-DD format)

**Response**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "fullName": "John Doe",
        "mobile": "9175113022",
        "email": "john@example.com",
        "isActive": true,
        "kycStatus": "approved",
        "isVerified": true,
        "status": "active",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "role": {
          "id": 1,
          "name": "User",
          "slug": "user"
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
}
```

---

### 2. List Internal Users (Staff Roles)

Get paginated list of internal users (admin, marketing, seo, accountant, sales). Excludes super_admin role.

**Endpoint**: `GET /api/panel/users/list/internal`

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `search` (optional) - Search by name, email, or mobile (case-insensitive)
- `status` (optional) - Filter by status: `active`, `blocked`, `suspended`, `deleted`
- `startDate` (optional) - Filter users registered from this date (YYYY-MM-DD format)
- `endDate` (optional) - Filter users registered until this date (YYYY-MM-DD format)

**Response**:
```json
{
  "success": true,
  "message": "Internal users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 5,
        "fullName": "Admin User",
        "mobile": "9876543210",
        "email": "admin@example.com",
        "isActive": true,
        "kycStatus": "approved",
        "isVerified": true,
        "status": "active",
        "createdAt": "2025-01-10T08:00:00.000Z",
        "role": {
          "id": 2,
          "name": "Admin",
          "slug": "admin"
        }
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get User Details

Get detailed information about a specific user including profile and active subscription.

**Endpoint**: `GET /api/panel/users/view/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "countryCode": "+91",
      "mobile": "9175113022",
      "email": "john@example.com",
      "roleId": 1,
      "status": "active",
      "isActive": true,
      "isPhoneVerified": true,
      "isEmailVerified": true,
      "phoneVerifiedAt": "2025-01-15T10:30:00.000Z",
      "emailVerifiedAt": "2025-01-15T10:35:00.000Z",
      "lastLoginAt": "2025-01-20T14:20:00.000Z",
      "kycStatus": "approved",
      "isVerified": true,
      "subscriptionType": "paid",
      "subscriptionExpiresAt": "2025-02-15T10:30:00.000Z",
      "maxDevices": 3,
      "isAutoApproveEnabled": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:20:00.000Z",
      "role": {
        "id": 1,
        "name": "User",
        "slug": "user"
      },
      "profile": {
        "id": 1,
        "userId": 1,
        "dob": "1990-05-15",
        "gender": "male",
        "about": "Car enthusiast",
        "businessName": "John's Auto Sales",
        "gstin": "22AAAAA0000A1Z5",
        "aadharNumber": "123456789012",
        "panNumber": "ABCDE1234F",
        "addressLine1": "123 Main Street",
        "addressLine2": "Near City Mall",
        "city": "Mumbai",
        "stateId": 1,
        "stateName": "Maharashtra",
        "country": "India",
        "pincode": "400001",
        "profilePhoto": "http://localhost:5000/uploads/profiles/user-1/photo.jpg",
        "profilePhotoStorageType": "local",
        "profilePhotoMimeType": "image/jpeg"
      }
    },
    "activeSubscription": {
      "id": 10,
      "userId": 1,
      "planId": 2,
      "planName": "Premium Plan",
      "planCode": "premium",
      "status": "active",
      "startsAt": "2025-01-15T10:30:00.000Z",
      "endsAt": "2025-02-15T10:30:00.000Z",
      "maxTotalListings": 50,
      "maxActiveListings": 20,
      "maxFeaturedListings": 5,
      "isAutoApproveEnabled": true
    }
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

### 4. Create User

Create a new internal user (staff member). Cannot create super_admin or user roles.

**Endpoint**: `POST /api/panel/users/create`

**Request Body**:
```json
{
  "fullName": "Marketing Manager",
  "countryCode": "+91",
  "mobile": "9123456789",
  "email": "marketing@example.com",
  "password": "SecurePass123!",
  "roleSlug": "marketing",
  "isActive": true,
  "isPhoneVerified": false,
  "isEmailVerified": false
}
```

**Required Fields**:
- `fullName` (string, max 150 chars)
- `mobile` (string, max 15 chars, unique)
- `password` (string)
- `roleSlug` (string) - Must be one of: `admin`, `marketing`, `seo`, `accountant`, `sales`

**Optional Fields**:
- `countryCode` (string, default: "+91")
- `email` (string, max 150 chars, unique)
- `isActive` (boolean, default: true)
- `isPhoneVerified` (boolean, default: false)
- `isEmailVerified` (boolean, default: false)

**Response** (201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": 15
  }
}
```

**Error Responses**:

Validation Error (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "general",
      "message": "Full name, mobile, and password are required"
    }
  ]
}
```

Duplicate Mobile (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "general",
      "message": "Mobile number already registered"
    }
  ]
}
```

Invalid Role (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "general",
      "message": "Cannot create users with super_admin or user role"
    }
  ]
}
```

---

### 5. Toggle User Status

Activate or deactivate a user account. **Requires explicit payload with desired state.**

**Endpoint**: `PATCH /api/panel/users/status/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Request Body**:
```json
{
  "isActive": false
}
```

**Required Fields**:
- `isActive` (boolean) - **Explicit state**: true to activate, false to deactivate

**Response**:
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "userId": 1,
    "isActive": false,
    "status": "suspended"
  }
}
```

**Notes**:
- When `isActive` is set to `false`, status becomes `suspended`
- When `isActive` is set to `true`, status becomes `active`

---

### 6. Delete User

Soft delete a user account. Cannot delete super_admin users.

**Endpoint**: `DELETE /api/panel/users/delete/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "userId": 1
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Cannot delete super admin user",
  "data": null
}
```

**Notes**:
- This is a soft delete (paranoid mode)
- User status is set to `deleted`
- User data is retained but marked as deleted

---

### 7. Update KYC Status

Update user's KYC verification status. **Requires explicit payload with new status.**

**Endpoint**: `PATCH /api/panel/users/kyc-status/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Request Body**:
```json
{
  "kycStatus": "approved"
}
```

**Required Fields**:
- `kycStatus` (string) - Must be one of: `pending`, `approved`, `rejected`

**Response**:
```json
{
  "success": true,
  "message": "KYC status updated successfully",
  "data": {
    "userId": 1,
    "kycStatus": "approved"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid KYC status. Must be pending, approved, or rejected",
  "data": null
}
```

---

### 8. Make User Verified

Mark a user as verified (trusted user badge).

**Endpoint**: `PATCH /api/panel/users/verify/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Response**:
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": {
    "userId": 1,
    "isVerified": true
  }
}
```

**Notes**:
- Verified users get a trusted badge
- This is separate from KYC status
- Typically given to reputable sellers

---

### 9. Toggle Auto-Approve

Enable or disable auto-approval for user's listings. **Requires explicit payload with desired state.**

**Endpoint**: `PATCH /api/panel/users/auto-approve/:userId`

**URL Parameters**:
- `userId` (required) - User ID

**Request Body**:
```json
{
  "isEnabled": true
}
```

**Required Fields**:
- `isEnabled` (boolean) - **Explicit state**: true to enable, false to disable

**Response**:
```json
{
  "success": true,
  "message": "Auto-approve enabled successfully",
  "data": {
    "userId": 1,
    "isAutoApproveEnabled": true
  }
}
```

**Notes**:
- When enabled, user's listings are automatically approved without admin review
- Typically given to trusted/verified users
- Can be overridden by subscription plan settings

---

### 10. Get User Statistics

Get overall user statistics for dashboard.

**Endpoint**: `GET /api/panel/users/statistics`

**Response**:
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 1523,
    "activeUsers": 1401,
    "verifiedUsers": 342,
    "kycPending": 89
  }
}
```

**Notes**:
- Statistics only include users with 'user' role
- Does not include internal staff or super_admin

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Frontend Integration Examples

### React - List External Users

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search, status, startDate, endDate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/api/panel/users/list/external', {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `/api/panel/users/status/${userId}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>
        
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>KYC Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>{user.kycStatus}</td>
                <td>
                  <button onClick={() => toggleUserStatus(user.id, user.isActive)}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button onClick={() => window.location.href = `/users/${user.id}`}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {pagination.totalPages}</span>
        <button 
          disabled={page === pagination.totalPages} 
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UserList;
```

### React - Create Internal User

```javascript
import { useState } from 'react';
import axios from 'axios';

function CreateUser() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    roleSlug: 'admin',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        '/api/panel/users/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSuccess('User created successfully!');
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        password: '',
        roleSlug: 'admin',
        isActive: true
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Internal User</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Mobile"
        value={formData.mobile}
        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <select
        value={formData.roleSlug}
        onChange={(e) => setFormData({...formData, roleSlug: e.target.value})}
      >
        <option value="admin">Admin</option>
        <option value="marketing">Marketing</option>
        <option value="seo">SEO</option>
        <option value="accountant">Accountant</option>
        <option value="sales">Sales</option>
      </select>
      
      <label>
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
        />
        Active
      </label>
      
      <button type="submit">Create User</button>
    </form>
  );
}

export default CreateUser;
```

### React - Update KYC Status

```javascript
import axios from 'axios';

async function updateKycStatus(userId, status) {
  try {
    const response = await axios.patch(
      `/api/panel/users/kyc-status/${userId}`,
      { kycStatus: status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    console.log('KYC status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating KYC status:', error);
    throw error;
  }
}

// Usage
function KycApprovalButton({ userId }) {
  const handleApprove = async () => {
    try {
      await updateKycStatus(userId, 'approved');
      alert('KYC approved successfully!');
    } catch (error) {
      alert('Failed to approve KYC');
    }
  };

  const handleReject = async () => {
    try {
      await updateKycStatus(userId, 'rejected');
      alert('KYC rejected');
    } catch (error) {
      alert('Failed to reject KYC');
    }
  };

  return (
    <div>
      <button onClick={handleApprove}>Approve KYC</button>
      <button onClick={handleReject}>Reject KYC</button>
    </div>
  );
}
```

---

## Notes

### User Roles
- **user**: External users (buyers/sellers)
- **admin**: Full admin access
- **marketing**: Marketing and promotions
- **seo**: SEO management
- **accountant**: Financial management
- **sales**: Sales operations
- **super_admin**: System administrator (cannot be created via API)

### User Status Values
- `active`: User can access the platform
- `blocked`: User is blocked by admin
- `suspended`: User is temporarily suspended
- `deleted`: User is soft deleted

### KYC Status Values
- `pending`: KYC documents submitted, awaiting review
- `approved`: KYC verified and approved
- `rejected`: KYC rejected

### Subscription Assignment
Note: Subscription assignment functionality will be added once the subscription management module is complete. This will allow admins to manually assign subscription plans to users.

### Auto-Approve Feature
When enabled for a user:
- Their listings skip the approval queue
- Listings are published immediately
- Useful for trusted/verified sellers
- Can be overridden by subscription plan settings

### Search Functionality
The search parameter searches across:
- Full name (case-insensitive using ILIKE)
- Email (case-insensitive using ILIKE)
- Mobile number (using LIKE)

**Example**: `?search=john` will match:
- Full name: "John Doe", "Johnny Smith"
- Email: "john@example.com", "johnny123@mail.com"
- Mobile: "9175113022" (if contains "john" - unlikely but supported)

### Date Range Filtering
Filter users by registration date (created_at):
- `startDate`: Users registered on or after this date (inclusive)
- `endDate`: Users registered on or before this date (inclusive)
- Format: YYYY-MM-DD (e.g., "2025-01-15")
- Both parameters are optional and can be used independently

**Examples**:
- `?startDate=2025-01-01` - Users registered from Jan 1, 2025 onwards
- `?endDate=2025-01-31` - Users registered until Jan 31, 2025
- `?startDate=2025-01-01&endDate=2025-01-31` - Users registered in January 2025

### Combining Filters
All filters can be combined:
```
GET /api/panel/users/list/external?search=john&status=active&startDate=2025-01-01&endDate=2025-01-31&page=1&limit=20
```

This will return active users with "john" in their name/email/mobile, registered in January 2025.

### Pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Page numbers start from 1
