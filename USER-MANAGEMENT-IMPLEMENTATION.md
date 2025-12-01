# User Management Module - Implementation Summary

## Overview
Admin panel module for managing both external users (user role) and internal staff (admin, marketing, seo, accountant, sales roles). Excludes super_admin role from all operations.

## Files Created

### Repository Layer
- `src/repositories/userManagementRepository.js`
  - Database operations for user management
  - Separate queries for external vs internal users
  - User statistics aggregation

### Service Layer
- `src/services/userManagementService.js`
  - Business logic for user operations
  - Validation and error handling
  - Role-based filtering

### Controller Layer
- `src/controllers/panel/userManagementController.js`
  - HTTP request/response handling
  - Input validation
  - Response formatting

### Routes
- `src/routes/panel/userManagementRoutes.js`
  - All endpoints under `/api/panel/users`
  - Authentication required for all routes

### Documentation
- `API-Docs/user-management.md`
  - Complete API reference
  - Request/response examples
  - Frontend integration examples

## Key Features

### 1. User Listing
- **External Users**: List users with 'user' role
- **Internal Users**: List staff (admin, marketing, seo, accountant, sales)
- Pagination support (default 20 per page)
- Search by name, email, mobile
- Filter by status (active, blocked, suspended, deleted)

### 2. User Creation
- Create internal staff only (cannot create super_admin or user roles)
- Automatic password hashing with bcrypt
- Email and mobile uniqueness validation
- Role validation

### 3. User Management
- Toggle user status (activate/deactivate)
- Soft delete users (paranoid mode)
- Cannot delete super_admin users

### 4. KYC Management
- Update KYC status (pending, approved, rejected)
- Separate from verified badge

### 5. User Verification
- Mark users as verified (trusted badge)
- Typically for reputable sellers

### 6. Auto-Approve
- Enable/disable auto-approval for user listings
- Listings skip approval queue when enabled

### 7. Statistics
- Total users count
- Active users count
- Verified users count
- KYC pending count

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/panel/users/statistics` | Get user statistics |
| GET | `/api/panel/users/list/external` | List external users |
| GET | `/api/panel/users/list/internal` | List internal users |
| POST | `/api/panel/users/create` | Create internal user |
| GET | `/api/panel/users/view/:userId` | Get user details |
| PATCH | `/api/panel/users/status/:userId` | Toggle user status (explicit: isActive) |
| DELETE | `/api/panel/users/delete/:userId` | Delete user |
| PATCH | `/api/panel/users/kyc-status/:userId` | Update KYC status (explicit: kycStatus) |
| PATCH | `/api/panel/users/verify/:userId` | Make user verified |
| PATCH | `/api/panel/users/auto-approve/:userId` | Toggle auto-approve (explicit: isEnabled) |

## Security Features

1. **Authentication Required**: All endpoints require JWT token
2. **Role Validation**: Cannot create super_admin or user roles via API
3. **Super Admin Protection**: Cannot delete super_admin users
4. **Password Hashing**: Bcrypt with 10 salt rounds
5. **Soft Delete**: User data retained with paranoid mode
6. **Audit Trail**: created_by and deleted_by tracking

## Data Returned in Lists

Minimal data for performance:
- id
- fullName
- mobile
- email
- isActive
- kycStatus
- isVerified
- status
- createdAt
- role (id, name, slug)

Profile data NOT loaded in lists (only in detail view).

## Future Enhancements

### Subscription Assignment (Pending)
Once subscription management module is complete:
- Manually assign subscription plans to users
- Override subscription quotas
- Extend subscription periods

### Possible Additions
- Bulk operations (activate/deactivate multiple users)
- Export user data (CSV/Excel)
- User activity logs
- Email notifications on status changes
- Advanced filters (registration date range, subscription type)

## Testing Checklist

- [ ] List external users with pagination
- [ ] List internal users with pagination
- [ ] Search users by name, email, mobile
- [ ] Filter users by status
- [ ] Get user details with profile and subscription
- [ ] Create internal user (admin, marketing, etc.)
- [ ] Prevent creating super_admin via API
- [ ] Prevent creating user role via API
- [ ] Toggle user status (activate/deactivate)
- [ ] Delete user (soft delete)
- [ ] Prevent deleting super_admin
- [ ] Update KYC status (pending, approved, rejected)
- [ ] Make user verified
- [ ] Toggle auto-approve
- [ ] Get user statistics
- [ ] Validate duplicate mobile/email on creation
- [ ] Validate role exists on creation
- [ ] Test authentication requirement on all endpoints

## Notes

- All operations exclude super_admin role for security
- User lists are optimized (no profile data loaded)
- Soft delete preserves user data
- Auto-approve can be overridden by subscription settings
- KYC status is separate from verified badge
- Statistics only count users with 'user' role
