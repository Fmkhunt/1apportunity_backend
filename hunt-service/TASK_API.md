# Task API Documentation

This document describes the Task CRUD operations available in the Hunt Service.

## Base URL
```
http://localhost:3000/api/tasks
```

## Endpoints

### 1. Create Task
**POST** `/api/tasks`

Creates a new task.

**Request Body:**
```json
{
  "name": "Task Name",
  "description": "Task description",
  "duration": "00:30:00",
  "reward": 100,
  "status": "active",
  "created_by": "user_id",
  "updated_by": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "name": "Task Name",
    "description": "Task description",
    "duration": "00:30:00",
    "reward": 100,
    "status": "active",
    "created_by": "user_id",
    "updated_by": "user_id",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Tasks
**GET** `/api/tasks`

Retrieves all tasks with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status ('active' or 'inactive')
- `search` (optional): Search in name and description

**Example:**
```
GET /api/tasks?page=1&limit=10&status=active&search=task
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 3. Get Active Tasks
**GET** `/api/tasks/active`

Retrieves only active tasks.

**Response:**
```json
{
  "success": true,
  "message": "Active tasks retrieved successfully",
  "data": [...]
}
```

### 4. Get Task by ID
**GET** `/api/tasks/:taskId`

Retrieves a specific task by ID.

**Response:**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Task Name",
    "description": "Task description",
    "duration": "00:30:00",
    "reward": 100,
    "status": "active",
    "created_by": "user_id",
    "updated_by": "user_id",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Task
**PUT** `/api/tasks/:taskId`

Updates an existing task.

**Request Body:**
```json
{
  "name": "Updated Task Name",
  "description": "Updated description",
  "duration": "01:00:00",
  "reward": 200,
  "status": "inactive",
  "updated_by": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Task Name",
    "description": "Updated description",
    "duration": "01:00:00",
    "reward": 200,
    "status": "inactive",
    "created_by": "user_id",
    "updated_by": "user_id",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Toggle Task Status
**PATCH** `/api/tasks/:taskId/toggle-status`

Toggles the status of a task between active and inactive.

**Request Body:**
```json
{
  "updated_by": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task status toggled successfully",
  "data": {
    "id": "uuid",
    "name": "Task Name",
    "description": "Task description",
    "duration": "00:30:00",
    "reward": 100,
    "status": "inactive",
    "created_by": "user_id",
    "updated_by": "user_id",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Delete Task
**DELETE** `/api/tasks/:taskId`

Deletes a task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {}
}
```

## Validation Rules

### Task Creation/Update
- `name`: Required, string, max 255 characters
- `description`: Required, string, min 1 character
- `duration`: Required, time format (HH:MM:SS)
- `reward`: Required, integer, min 1
- `status`: Optional, enum ('active', 'inactive'), default 'active'
- `created_by`: Required for creation, string
- `updated_by`: Required for updates, string

### Query Parameters
- `page`: Optional, integer, min 1, default 1
- `limit`: Optional, integer, min 1, max 100, default 10
- `status`: Optional, enum ('active', 'inactive')
- `search`: Optional, string, min 1 character

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Task not found",
  "data": null
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```