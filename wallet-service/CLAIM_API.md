# Claim API Documentation

This document describes the CRUD operations available for the claims table in the claim-service.

## Table Structure

The claims table has the following structure:

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward INTEGER NOT NULL,
  claim_type VARCHAR(255) NOT NULL,
  levels JSONB[],
  coupen_code VARCHAR(100),
  product_img VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Levels Structure

The `levels` field stores an array of objects with the following structure:

```json
[
  {
    "level": 1,
    "user_count": 1,
    "rewards": 1000
  },
  {
    "level": 2,
    "user_count": 3,
    "rewards": 100
  }
]
```

## API Endpoints

### Base URL
```
/admin/claim
```

### 1. Create Claim
**POST** `/admin/claim`

Creates a new claim.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reward": 1000,
  "claim_type": "referral_bonus",
  "levels": [
    {
      "level": 1,
      "user_count": 1,
      "rewards": 1000
    },
    {
      "level": 2,
      "user_count": 3,
      "rewards": 100
    }
  ],
  "coupen_code": "WELCOME100",
  "product_img": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "reward": 1000,
    "claim_type": "referral_bonus",
    "levels": [...],
    "coupen_code": "WELCOME100",
    "product_img": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Claim created successfully",
  "success": true
}
```

### 2. Get All Claims
**GET** `/admin/claim`

Retrieves all claims with pagination and filtering.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in claim_type and coupen_code
- `claim_type` (optional): Filter by claim type

**Response:**
```json
{
  "data": {
    "claims": [...],
    "totalRecords": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": "Claims retrieved successfully",
  "success": true
}
```

### 3. Get Claim by ID
**GET** `/admin/claim/:claimId`

Retrieves a specific claim by ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "reward": 1000,
    "claim_type": "referral_bonus",
    "levels": [...],
    "coupen_code": "WELCOME100",
    "product_img": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Claim retrieved successfully",
  "success": true
}
```

### 4. Update Claim
**PUT** `/admin/claim/:claimId`

Updates an existing claim.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reward": 1500,
  "claim_type": "referral_bonus",
  "levels": [
    {
      "level": 1,
      "user_count": 2,
      "rewards": 1500
    }
  ],
  "coupen_code": "WELCOME150",
  "product_img": "https://example.com/new-image.jpg"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "reward": 1500,
    "claim_type": "referral_bonus",
    "levels": [...],
    "coupen_code": "WELCOME150",
    "product_img": "https://example.com/new-image.jpg",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Claim updated successfully",
  "success": true
}
```

### 5. Delete Claim
**DELETE** `/admin/claim/:claimId`

Deletes a claim.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {},
  "message": "Claim deleted successfully",
  "success": true
}
```

### 6. Get Claims by Type
**GET** `/admin/claim/type/:claimType`

Retrieves all claims of a specific type.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid1",
      "reward": 1000,
      "claim_type": "referral_bonus",
      "levels": [...],
      "coupen_code": "WELCOME100",
      "product_img": "https://example.com/image.jpg",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Claims retrieved successfully",
  "success": true
}
```

## Error Responses

### Validation Error (400)
```json
{
  "data": [
    {
      "field": "reward",
      "message": "\"reward\" must be a positive integer"
    }
  ],
  "message": "Validation failed",
  "success": false
}
```

### Not Found Error (404)
```json
{
  "data": null,
  "message": "Claim not found",
  "success": false
}
```

### Unauthorized Error (401)
```json
{
  "data": null,
  "message": "Access token is required",
  "success": false
}
```

## Validation Rules

### Create Claim
- `reward`: Required, positive integer
- `claim_type`: Required, string (1-255 characters)
- `levels`: Optional, array of objects with:
  - `level`: Required, positive integer
  - `user_count`: Required, positive integer
  - `rewards`: Required, positive integer
- `coupen_code`: Optional, string (max 100 characters)
- `product_img`: Optional, string (max 255 characters)

### Update Claim
- All fields are optional
- Same validation rules as create for provided fields

### Query Parameters
- `page`: Optional, positive integer (default: 1)
- `limit`: Optional, positive integer (1-100, default: 10)
- `search`: Optional, string (min 1 character)
- `claim_type`: Optional, string (min 1 character) 