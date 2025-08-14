# Hunt API Documentation

This document describes the hunt management endpoints for the hunt service.

## Database Schema

```sql
CREATE TABLE hunts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id),
  claim_id uuid NOT NULL REFERENCES claims(id),
  name varchar(255) NOT NULL,
  description text NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  coordinates text NOT NULL, -- GEOGRAPHY stored as WKT text
  duration time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## API Endpoints

### Base URL
All hunt endpoints are prefixed with `/api/admin/hunt`

### Authentication
All endpoints require admin authentication. Include the admin JWT token in the Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

### 1. Create Hunt
**POST** `/api/admin/hunt`

**Request Body:**
```json
{
  "task_id": "uuid",
  "claim_id": "uuid",
  "name": "Hunt Name",
  "description": "Hunt Description",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-01-31T23:59:59.000Z",
  "coordinates": "POINT(-122.4194 37.7749)",
  "duration": "02:30:00"
}
```

**Alternative coordinates format:**
```json
{
  "coordinates": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "claim_id": "uuid",
    "name": "Hunt Name",
    "description": "Hunt Description",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.000Z",
    "coordinates": "POINT(-122.4194 37.7749)",
    "duration": "02:30:00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Hunt created successfully",
  "success": true
}
```

### 2. Get All Hunts
**GET** `/api/admin/hunt`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name and description
- `task_id` (optional): Filter by task ID
- `claim_id` (optional): Filter by claim ID

**Response:**
```json
{
  "data": {
    "hunts": [
      {
        "id": "uuid",
        "task_id": "uuid",
        "claim_id": "uuid",
        "name": "Hunt Name",
        "description": "Hunt Description",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-01-31T23:59:59.000Z",
        "coordinates": "POINT(-122.4194 37.7749)",
        "duration": "02:30:00",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalRecords": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Hunts retrieved successfully",
  "success": true
}
```

### 3. Get Hunt by ID
**GET** `/api/admin/hunt/:huntId`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "claim_id": "uuid",
    "name": "Hunt Name",
    "description": "Hunt Description",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.000Z",
    "coordinates": "POINT(-122.4194 37.7749)",
    "duration": "02:30:00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Hunt retrieved successfully",
  "success": true
}
```

### 4. Update Hunt
**PUT** `/api/admin/hunt/:huntId`

**Request Body:**
```json
{
  "name": "Updated Hunt Name",
  "description": "Updated Hunt Description",
  "coordinates": "POINT(-122.4194 37.7749)"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "claim_id": "uuid",
    "name": "Updated Hunt Name",
    "description": "Updated Hunt Description",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.000Z",
    "coordinates": "POINT(-122.4194 37.7749)",
    "duration": "02:30:00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Hunt updated successfully",
  "success": true
}
```

### 5. Delete Hunt
**DELETE** `/api/admin/hunt/:huntId`

**Response:**
```json
{
  "data": {},
  "message": "Hunt deleted successfully",
  "success": true
}
```

### 6. Get Hunts by Task ID
**GET** `/api/admin/hunt/task/:taskId`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "claim_id": "uuid",
      "name": "Hunt Name",
      "description": "Hunt Description",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-31T23:59:59.000Z",
      "coordinates": "POINT(-122.4194 37.7749)",
      "duration": "02:30:00",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Hunts retrieved successfully",
  "success": true
}
```

### 7. Get Hunts by Claim ID
**GET** `/api/admin/hunt/claim/:claimId`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "claim_id": "uuid",
      "name": "Hunt Name",
      "description": "Hunt Description",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-01-31T23:59:59.000Z",
      "coordinates": "POINT(-122.4194 37.7749)",
      "duration": "02:30:00",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Hunts retrieved successfully",
  "success": true
}
```

## Error Responses

### Validation Error (400)
```json
{
  "data": null,
  "message": "Validation failed",
  "success": false
}
```

### Not Found Error (404)
```json
{
  "data": null,
  "message": "Hunt not found",
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

## Notes

1. **Coordinates Format**: Coordinates can be provided either as:
   - WKT (Well-Known Text) string: `"POINT(-122.4194 37.7749)"`
   - Object: `{"latitude": 37.7749, "longitude": -122.4194}`

2. **Duration Format**: Duration should be in HH:MM:SS format (e.g., "02:30:00")

3. **Date Format**: All dates should be in ISO 8601 format

4. **Pagination**: The API supports pagination with `page` and `limit` parameters

5. **Search**: The search functionality searches in both `name` and `description` fields 