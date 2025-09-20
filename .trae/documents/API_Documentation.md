# API Documentation

> Complete API reference for the Project Management Tool including REST endpoints, GraphQL schema, and WebSocket events.

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
3. [GraphQL API](#graphql-api)
4. [WebSocket Events](#websocket-events)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Examples](#api-examples)

## Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Login Flow

1. **Login**: `POST /api/auth/login`
2. **Receive JWT token** in response
3. **Include token** in subsequent requests
4. **Refresh token** when expired (if refresh endpoint available)

---

## REST API Endpoints

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### User Management Endpoints

#### GET /users/profile
Get current user profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /users/profile
Update current user profile.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### POST /users/seed-admin
Seed admin user (development only).

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Project Management Endpoints

#### GET /projects
Get all projects for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Project Alpha",
      "description": "Project description",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "tasks": [],
      "members": []
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "ACTIVE"
}
```

#### GET /projects/:id
Get project by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "Project description",
  "status": "ACTIVE",
  "tasks": [
    {
      "id": "uuid",
      "title": "Task 1",
      "status": "TODO",
      "priority": "HIGH"
    }
  ],
  "members": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "OWNER"
    }
  ]
}
```

#### PUT /projects/:id
Update project.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

#### DELETE /projects/:id
Delete project.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### Task Management Endpoints

#### GET /tasks
Get all tasks with optional filtering.

**Query Parameters:**
- `projectId` (optional): Filter by project
- `status` (optional): Filter by status (TODO, IN_PROGRESS, DONE)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH)
- `assigneeId` (optional): Filter by assignee

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "project": {
        "id": "uuid",
        "name": "Project Alpha"
      },
      "assignee": {
        "id": "uuid",
        "name": "John Doe"
      },
      "dependencies": [
        {
          "id": "uuid",
          "title": "Dependency Task"
        }
      ]
    }
  ]
}
```

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "projectId": "uuid",
  "assigneeId": "uuid",
  "priority": "HIGH",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "dependencyIds": ["uuid1", "uuid2"]
}
```

#### GET /tasks/:id
Get task by ID.

#### PUT /tasks/:id
Update task.

#### DELETE /tasks/:id
Delete task.

#### GET /tasks/topological-sort
Get tasks in topological order based on dependencies.

**Query Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
{
  "sortedTasks": [
    {
      "id": "uuid",
      "title": "Foundation Task",
      "level": 0
    },
    {
      "id": "uuid",
      "title": "Dependent Task",
      "level": 1
    }
  ],
  "hasCycle": false
}
```

### Analytics Endpoints

#### GET /analytics/dashboard
Get dashboard analytics data.

**Response:**
```json
{
  "projectStats": {
    "total": 10,
    "active": 7,
    "completed": 3
  },
  "taskStats": {
    "total": 45,
    "todo": 15,
    "inProgress": 20,
    "done": 10
  },
  "userStats": {
    "totalUsers": 25,
    "activeUsers": 18
  },
  "recentActivity": [
    {
      "type": "task_created",
      "description": "New task created",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /analytics/projects/:id
Get project-specific analytics.

**Response:**
```json
{
  "projectId": "uuid",
  "taskCompletion": {
    "completed": 15,
    "total": 20,
    "percentage": 75
  },
  "timeTracking": {
    "totalHours": 120,
    "averageTaskTime": 8
  },
  "memberContribution": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "tasksCompleted": 8,
      "hoursWorked": 40
    }
  ]
}
```

### Search Endpoints

#### GET /search
Search across projects, tasks, and users.

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): Filter by type (projects, tasks, users)
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "results": {
    "projects": [
      {
        "id": "uuid",
        "name": "Project Alpha",
        "description": "Matching description",
        "score": 0.95
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "title": "Matching Task",
        "description": "Task description",
        "score": 0.87
      }
    ],
    "users": []
  },
  "total": 2
}
```

### Notification Endpoints

#### GET /notifications
Get user notifications.

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)
- `limit` (optional): Number of notifications (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "TASK_ASSIGNED",
      "title": "New task assigned",
      "message": "You have been assigned to task 'Important Task'",
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "data": {
        "taskId": "uuid",
        "projectId": "uuid"
      }
    }
  ]
}
```

#### PUT /notifications/:id/read
Mark notification as read.

#### PUT /notifications/mark-all-read
Mark all notifications as read.

---

## GraphQL API

### Endpoint
- **URL**: `/graphql`
- **Playground**: Available in development at `/graphql`

### Schema Overview

#### Types

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  projects: [Project!]!
  assignedTasks: [Task!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Project {
  id: ID!
  name: String!
  description: String
  status: ProjectStatus!
  owner: User!
  members: [User!]!
  tasks: [Task!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  dueDate: DateTime
  project: Project!
  assignee: User
  dependencies: [Task!]!
  dependents: [Task!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  ADMIN
  USER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

#### Queries

```graphql
type Query {
  # User queries
  me: User
  users: [User!]!
  user(id: ID!): User
  
  # Project queries
  projects: [Project!]!
  project(id: ID!): Project
  
  # Task queries
  tasks(projectId: ID, status: TaskStatus): [Task!]!
  task(id: ID!): Task
  taskTopologicalSort(projectId: ID!): [Task!]!
}
```

#### Mutations

```graphql
type Mutation {
  # Project mutations
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  
  # Task mutations
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  addTaskDependency(taskId: ID!, dependencyId: ID!): Task!
  removeTaskDependency(taskId: ID!, dependencyId: ID!): Task!
}
```

#### Input Types

```graphql
input CreateProjectInput {
  name: String!
  description: String
  status: ProjectStatus = ACTIVE
}

input UpdateProjectInput {
  name: String
  description: String
  status: ProjectStatus
}

input CreateTaskInput {
  title: String!
  description: String
  projectId: ID!
  assigneeId: ID
  priority: TaskPriority = MEDIUM
  dueDate: DateTime
  dependencyIds: [ID!]
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: TaskPriority
  assigneeId: ID
  dueDate: DateTime
}
```

### Example Queries

#### Get Projects with Tasks
```graphql
query GetProjectsWithTasks {
  projects {
    id
    name
    description
    status
    tasks {
      id
      title
      status
      priority
      assignee {
        id
        name
      }
    }
  }
}
```

#### Create Task with Dependencies
```graphql
mutation CreateTaskWithDependencies($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    status
    dependencies {
      id
      title
    }
  }
}
```

---

## WebSocket Events

### Connection
- **Namespace**: `/notifications`
- **URL**: `ws://localhost:3001/notifications`

### Authentication
Include JWT token in connection query:
```javascript
const socket = io('/notifications', {
  query: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client → Server Events

##### `join-room`
Join a project-specific room for notifications.
```javascript
socket.emit('join-room', { projectId: 'uuid' });
```

##### `leave-room`
Leave a project-specific room.
```javascript
socket.emit('leave-room', { projectId: 'uuid' });
```

#### Server → Client Events

##### `notification`
General notification event.
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // {
  //   id: 'uuid',
  //   type: 'TASK_ASSIGNED',
  //   title: 'New task assigned',
  //   message: 'You have been assigned to task "Important Task"',
  //   data: { taskId: 'uuid', projectId: 'uuid' }
  // }
});
```

##### `task-assigned`
Task assignment notification.
```javascript
socket.on('task-assigned', (data) => {
  // {
  //   taskId: 'uuid',
  //   taskTitle: 'Important Task',
  //   assigneeId: 'uuid',
  //   assigneeName: 'John Doe',
  //   projectId: 'uuid'
  // }
});
```

##### `task-updated`
Task status or details updated.
```javascript
socket.on('task-updated', (data) => {
  // {
  //   taskId: 'uuid',
  //   changes: { status: 'IN_PROGRESS' },
  //   updatedBy: 'uuid',
  //   projectId: 'uuid'
  // }
});
```

##### `project-updated`
Project details updated.
```javascript
socket.on('project-updated', (data) => {
  // {
  //   projectId: 'uuid',
  //   changes: { name: 'New Project Name' },
  //   updatedBy: 'uuid'
  // }
});
```

##### `user-joined-project`
New user added to project.
```javascript
socket.on('user-joined-project', (data) => {
  // {
  //   userId: 'uuid',
  //   userName: 'Jane Doe',
  //   projectId: 'uuid',
  //   role: 'MEMBER'
  // }
});
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Common Error Scenarios

#### Authentication Errors
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Validation Errors
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

#### Resource Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

---

## Rate Limiting

### Default Limits
- **General API**: 100 requests per minute per IP
- **Authentication**: 5 login attempts per minute per IP
- **Search**: 20 requests per minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

---

## API Examples

### Complete Task Management Flow

#### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 2. Create Project
```bash
curl -X POST http://localhost:3001/api/projects \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "name": "Website Redesign",
    "description": "Complete website redesign project"
  }'
```

#### 3. Create Tasks with Dependencies
```bash
# Create foundation task
curl -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "title": "Design Mockups",
    "description": "Create initial design mockups",
    "projectId": "<project-id>",
    "priority": "HIGH"
  }'

# Create dependent task
curl -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "title": "Frontend Implementation",
    "description": "Implement frontend based on mockups",
    "projectId": "<project-id>",
    "dependencyIds": ["<mockup-task-id>"],
    "priority": "MEDIUM"
  }'
```

#### 4. Get Topological Sort
```bash
curl -X GET "http://localhost:3001/api/tasks/topological-sort?projectId=<project-id>" \
  -H 'Authorization: Bearer <token>'
```

### WebSocket Integration Example

```javascript
// Frontend WebSocket integration
import io from 'socket.io-client';

const socket = io('/notifications', {
  query: { token: localStorage.getItem('jwt_token') }
});

// Join project room
socket.emit('join-room', { projectId: 'project-uuid' });

// Listen for notifications
socket.on('notification', (notification) => {
  // Display toast notification
  showToast(notification.title, notification.message);
});

socket.on('task-assigned', (data) => {
  // Update UI for new task assignment
  updateTaskList();
});

socket.on('task-updated', (data) => {
  // Update specific task in UI
  updateTask(data.taskId, data.changes);
});
```

---

## Postman Collection

A complete Postman collection is available with all endpoints pre-configured:

1. Import the collection from `/docs/postman/Project-Management-API.json`
2. Set environment variables:
   - `base_url`: `http://localhost:3001/api`
   - `jwt_token`: Your JWT token after login
3. Run the authentication request first
4. Use the token for subsequent requests

---

## SDK Examples

### JavaScript/TypeScript SDK Usage

```typescript
import { ProjectManagementAPI } from './api-client';

const api = new ProjectManagementAPI({
  baseURL: 'http://localhost:3001/api',
  token: 'your-jwt-token'
});

// Create project
const project = await api.projects.create({
  name: 'New Project',
  description: 'Project description'
});

// Create task with dependencies
const task = await api.tasks.create({
  title: 'New Task',
  projectId: project.id,
  dependencyIds: ['task-1-id', 'task-2-id']
});

// Get topological sort
const sortedTasks = await api.tasks.getTopologicalSort(project.id);
```

This comprehensive API documentation provides all the information needed to integrate with the Project Management Tool's backend services.