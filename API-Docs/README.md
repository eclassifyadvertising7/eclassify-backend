# API Documentation

Welcome to the Classified Ads Platform API documentation.

## Available Modules

- [Authentication](./authentication.md) - User signup, login, and profile management

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Common Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

## Getting Started

1. **Signup**: Create a new account using `/api/auth/signup`
2. **Login**: Authenticate and receive JWT token using `/api/auth/login`
3. **Use Token**: Include the token in Authorization header for protected endpoints
4. **Access Profile**: Get your profile data using `/api/auth/profile`

## Environment Setup

Required environment variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

See `.env.example` for complete configuration.
