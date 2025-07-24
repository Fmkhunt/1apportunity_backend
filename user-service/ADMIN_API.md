# Admin Authentication API

This document describes the admin authentication endpoints for the user service.

## Setup

1. **Create Admin Table**: The admin table will be created automatically when the application starts.

2. **Create Default Admin**: Run the following command to create a default admin user:
   ```bash
   npm run admin:setup
   ```

   This creates a default admin with:
   - Email: `admin@example.com`
   - Password: `admin123456`
   - Role: `admin`
   - Permissions: `['users:read', 'users:write', 'admin:read', 'admin:write']`

## Database Schema

```sql
CREATE TABLE public.admin (
    id uuid NOT NULL,
    email varchar(200),
    password varchar(200),
    role VARCHAR(50) DEFAULT 'manager',
    area GEOMETRY(POLYGON, 4326),
    permissions jsonb[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

## API Endpoints

### Base URL
All admin endpoints are prefixed with `/api/admin`

### 1. Admin Login
**POST** `/api/admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Admin logged in successfully",
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["users:read", "users:write"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### 2. Refresh Token
**POST** `/api/admin/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Token refreshed successfully",
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### 3. Get Admin Profile
**GET** `/api/admin/auth/profile`

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "status": 1,
  "message": "Profile retrieved successfully",
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": ["users:read", "users:write"],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Admin Logout
**POST** `/api/admin/auth/logout`

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "status": 1,
  "message": "Logged out successfully",
  "success": true,
  "data": {}
}
```

## Authentication

### JWT Token Structure
Admin JWT tokens contain the following payload:
```json
{
  "adminId": "uuid",
  "email": "admin@example.com",
  "role": "admin",
  "tokenType": "accessToken|refreshToken",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Using Admin Tokens
Include the access token in the Authorization header for protected endpoints:
```
Authorization: Bearer your_jwt_access_token
```

## Error Responses

### 401 Unauthorized
```json
{
  "status": 0,
  "message": "Invalid credentials",
  "success": false,
  "data": null
}
```

### 400 Bad Request
```json
{
  "status": 0,
  "message": "Validation error",
  "success": false,
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

## Admin Roles and Permissions

### Available Roles
- `admin`: Full access to all features
- `manager`: Limited administrative access
- `supervisor`: Basic administrative access

### Permission System
Permissions are stored as an array of strings. Common permissions include:
- `users:read` - Can view users
- `users:write` - Can create/update users
- `admin:read` - Can view admin data
- `admin:write` - Can create/update admins

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: Access tokens expire, refresh tokens for renewal
4. **Input Validation**: All inputs are validated using express-validator
5. **Rate Limiting**: Authentication endpoints are rate-limited

## File Structure

```
src/
├── models/
│   ├── Admin.ts              # Admin model with database operations
│   └── schema.ts             # Database schema including admin table
├── services/
│   └── adminAuth.service.ts  # Admin authentication business logic
├── controllers/
│   └── admin/
│       └── auth.controller.ts # Admin authentication controller
├── routes/
│   └── admin/
│       ├── index.ts          # Admin route router
│       └── auth.routes.ts    # Admin authentication routes
├── middlewares/
│   └── auth.ts               # Authentication middleware (updated)
├── validations/
│   └── adminValidation.ts    # Admin input validation
└── scripts/
    └── createAdminTable.ts   # Script to create default admin
```