# Task API

This document describes the current Task CRUD vertical slice for the Personal Productivity System.

## Base path

`/tasks`

## Supported endpoints

### Create task

`POST /tasks`

Creates a task for an existing user.

Example request body:

```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "title": "Finish database assignment",
  "description": "Complete the final ER diagram and summary section.",
  "status": "queued",
  "priority": "important",
  "estimatedDurationMinutes": 90,
  "minimumDurationMinutes": 30,
  "dueAt": "2026-10-10T09:00:00.000Z",
  "projectId": null,
  "courseId": null,
  "goalId": null
}
```

Example success response:

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "userId": "11111111-1111-4111-8111-111111111111",
  "projectId": null,
  "courseId": null,
  "goalId": null,
  "title": "Finish database assignment",
  "description": "Complete the final ER diagram and summary section.",
  "status": "queued",
  "priority": "important",
  "estimatedDurationMinutes": 90,
  "minimumDurationMinutes": 30,
  "dueAt": "2026-10-10T09:00:00.000Z",
  "completedAt": null,
  "createdAt": "2026-09-24T15:00:00.000Z",
  "updatedAt": "2026-09-24T15:00:00.000Z"
}
```

### Get task by ID

`GET /tasks/:id`

Returns a single task record.

### List tasks

`GET /tasks`

Supports filtering and pagination:

- `user_id` (UUID)
- `status`
- `priority`
- `project_id` (UUID)
- `course_id` (UUID)
- `goal_id` (UUID)
- `limit` (1-100, default 50)
- `offset` (default 0)

Example:

```http
GET /tasks?user_id=11111111-1111-4111-8111-111111111111&status=queued&limit=10&offset=0
```

Example response:

```json
{
  "items": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "userId": "11111111-1111-4111-8111-111111111111",
      "projectId": null,
      "courseId": null,
      "goalId": null,
      "title": "Finish database assignment",
      "description": "Complete the final ER diagram and summary section.",
      "status": "queued",
      "priority": "important",
      "estimatedDurationMinutes": 90,
      "minimumDurationMinutes": 30,
      "dueAt": "2026-10-10T09:00:00.000Z",
      "completedAt": null,
      "createdAt": "2026-09-24T15:00:00.000Z",
      "updatedAt": "2026-09-24T15:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Update task

`PATCH /tasks/:id`

Allows partial updates to mutable task fields.

Example:

```json
{
  "title": "Finish database assignment draft",
  "status": "in_progress"
}
```

### Delete task

`DELETE /tasks/:id`

Returns `204 No Content` when the task existed and was deleted.

## Validation behavior

The API validates:

- required task fields
- UUID format for ids and references
- enum values for `status` and `priority`
- ISO timestamps for `dueAt` and `completedAt`
- integer duration values with reasonable bounds
- minimum duration must not exceed estimated duration
- optional relationship IDs may be null

Malformed requests return `400 Bad Request` with a consistent JSON error payload:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "title",
        "message": "title must not be empty"
      }
    ]
  }
}
```

## Error format

Error payloads follow this pattern:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

Common codes include:

- `VALIDATION_ERROR`
- `USER_NOT_FOUND`
- `PROJECT_NOT_FOUND`
- `COURSE_NOT_FOUND`
- `GOAL_NOT_FOUND`
- `TASK_NOT_FOUND`
- `INTERNAL_SERVER_ERROR`

## Notes

- This phase intentionally does not implement authentication.
- `user_id` is accepted in query filters as a temporary pattern until authentication is added.
- The database schema still drives the domain model; this API does not add scheduling-specific task fields.
