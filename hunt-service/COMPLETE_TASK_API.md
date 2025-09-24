# Complete Task API Documentation

This document describes the complete task functionality for the hunt service.

## Overview

The complete task API allows users to complete tasks within a hunt. Tasks can be of two types:
- **Mission**: Direct completion without verification
- **Question**: Requires answer verification before completion

## Database Schema Changes

### Complete Task Table
The `complete_task` table has been updated to include a `claim_id` field:

```sql
ALTER TABLE "complete_task" ADD COLUMN "claim_id" uuid;
ALTER TABLE "complete_task" ADD CONSTRAINT "complete_task_claim_id_claims_id_fk" 
FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE no action ON UPDATE no action;
```

## API Endpoint

### Complete Task
**POST** `/api/task/complete`

Completes a task for the authenticated user.

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hunt_id": "uuid",
  "task_id": "uuid",
  "answers": [
    {
      "question_id": "uuid",
      "answer": "string"
    }
  ]
}
```

**Parameters:**
- `hunt_id` (required): UUID of the hunt
- `task_id` (required): UUID of the task to complete
- `answers` (optional): Array of answers for question-type tasks
  - `question_id` (required): UUID of the question
  - `answer` (required): User's answer to the question

**Response:**
```json
{
  "data": {
    "rank": 1,
    "reward": 500,
    "completedTask": {
      "id": "uuid",
      "hunt_id": "uuid",
      "task_id": "uuid",
      "user_id": "uuid",
      "claim_id": "uuid",
      "rank": 1,
      "reward": 500,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Task completed successfully",
  "success": true
}
```

## Task Completion Logic

### Mission Type Tasks
- Tasks with `type: 'mission'` are completed directly without verification
- No answers are required
- Task is immediately marked as completed

### Question Type Tasks
- Tasks with `type: 'question'` require answer verification
- All answers must be provided and correct
- If any answer is incorrect, the task completion fails
- Only when all answers are correct, the task is marked as completed

## Rank Calculation

The rank is calculated based on how many users have completed the same task before:
- Rank = Count of previous completions + 1
- First user to complete gets rank 1
- Second user gets rank 2, and so on

## Reward Calculation

Rewards are calculated based on the claim's level configuration:

### Claim Levels Structure
```json
[
  {
    "level": 1,
    "rewards": 500,
    "user_count": 1
  },
  {
    "level": 2,
    "rewards": 50,
    "user_count": 3
  }
]
```

### Reward Logic
The reward calculation uses cumulative user counts:
- Level 1: First user (rank 1) gets 500 coins (user_count: 1)
- Level 2: Next 3 users (ranks 2, 3, 4) get 50 coins each (user_count: 3)
- Users beyond cumulative count get 0 coins

### Example Scenarios
- **User 1 (rank 1)**: Gets 500 coins (level 1, cumulative: 1)
- **User 2 (rank 2)**: Gets 50 coins (level 2, cumulative: 1+3=4)
- **User 3 (rank 3)**: Gets 50 coins (level 2, cumulative: 1+3=4)
- **User 4 (rank 4)**: Gets 50 coins (level 2, cumulative: 1+3=4)
- **User 5 (rank 5)**: Gets 0 coins (beyond cumulative count of 4)

## Error Responses

### 400 Bad Request
```json
{
  "message": "Task already completed by this user",
  "success": false
}
```

```json
{
  "message": "Answers are required for question type tasks",
  "success": false
}
```

```json
{
  "message": "Incorrect answers provided",
  "success": false
}
```

### 404 Not Found
```json
{
  "message": "Task not found",
  "success": false
}
```

### 401 Unauthorized
```json
{
  "message": "User not authenticated",
  "success": false
}
```

## Validation Rules

- `hunt_id` must be a valid UUID
- `task_id` must be a valid UUID
- `answers` array is optional but required for question-type tasks
- Each answer must have `question_id` (UUID) and `answer` (string)

## Usage Examples

### Complete Mission Task
```bash
curl -X POST http://localhost:3000/api/task/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "hunt_id": "123e4567-e89b-12d3-a456-426614174000",
    "task_id": "123e4567-e89b-12d3-a456-426614174001"
  }'
```

### Complete Question Task
```bash
curl -X POST http://localhost:3000/api/task/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "hunt_id": "123e4567-e89b-12d3-a456-426614174000",
    "task_id": "123e4567-e89b-12d3-a456-426614174001",
    "answers": [
      {
        "question_id": "123e4567-e89b-12d3-a456-426614174002",
        "answer": "Paris"
      },
      {
        "question_id": "123e4567-e89b-12d3-a456-426614174003",
        "answer": "Blue"
      }
    ]
  }'
```