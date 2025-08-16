# GOAT Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Authentication

#### POST /auth/login
Login with username/email/NIC and password.

**Request Body:**
```json
{
  "username": "string", // Can be username, email, or NIC
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "_id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "nic": "12345-1234567-1",
      "role": "user"
    }
  }
}
```

### 2. Applications

#### POST /applications
Submit a new application.

**Request Body:**
```json
{
  "trackingNumber": "TRK-2024-001",
  "name": "John Doe",
  "cnic": "12345-1234567-1",
  "phone": "0300-1234567",
  "email": "john@example.com",
  "address": "123 Main Street, City",
  "applicationType": "Passport Renewal",
  "officer": "Officer Name",
  "description": "Application description",
  "attachments": ["https://s3.amazonaws.com/bucket/file.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingNumber": "TRK-2024-001",
    "name": "John Doe",
    "cnic": "12345-1234567-1",
    "phone": "0300-1234567",
    "email": "john@example.com",
    "address": "123 Main Street, City",
    "applicationType": "Passport Renewal",
    "description": "Application description",
    "attachments": ["https://s3.amazonaws.com/bucket/file.pdf"],
    "acknowledgement": "Received",
    "status": "Submitted",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /applications
Get all applications (Admin/Superadmin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `applicationType` (optional): Filter by application type
- `officer` (optional): Filter by officer name
- `cnic` (optional): Filter by CNIC
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalApplications": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "statusBreakdown": [...],
      "applicationTypeBreakdown": [...]
    }
  }
}
```

#### GET /applications/:trackingNumber
Get application by tracking number.

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingNumber": "TRK-2024-001",
    "name": "John Doe",
    "cnic": "12345-1234567-1",
    "phone": "0300-1234567",
    "email": "john@example.com",
    "address": "123 Main Street, City",
    "applicationType": "Passport Renewal",
    "description": "Application description",
    "attachments": ["https://s3.amazonaws.com/bucket/file.pdf"],
    "acknowledgement": "Received",
    "status": "Submitted",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /applications/user/:cnic
Get user details with all applications (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "address": "123 Main Street, City",
      "email": "john@example.com",
      "nic": "12345-1234567-1",
      "phoneNo": "0300-1234567",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "applications": [
      {
        "_id": "app-id",
        "trackingNumber": "TRK-2024-001",
        "name": "John Doe",
        "cnic": "12345-1234567-1",
        "phone": "0300-1234567",
        "email": "john@example.com",
        "address": "123 Main Street, City",
        "applicationType": {
          "_id": "type-id",
          "name": "Passport Renewal",
          "description": "Passport renewal application"
        },
        "officer": {
          "_id": "officer-id",
          "name": "Officer Name",
          "designation": "Senior Officer",
          "department": "Passport Office"
        },
        "description": "Application description",
        "attachments": ["https://s3.amazonaws.com/bucket/file.pdf"],
        "status": "Submitted",
        "acknowledgement": "Received",
        "submittedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "applicationTypes": [...],
    "officers": [...]
  }
}
```

#### GET /applications/user/:cnic/summary
Get user applications summary (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "address": "123 Main Street, City",
      "email": "john@example.com",
      "nic": "12345-1234567-1",
      "phoneNo": "0300-1234567",
      "role": "user"
    },
    "summary": {
      "totalApplications": 5,
      "statusBreakdown": [
        { "_id": "Submitted", "count": 3 },
        { "_id": "Processing", "count": 1 },
        { "_id": "Completed", "count": 1 }
      ],
      "applicationTypeDistribution": [
        { "_id": "Passport Renewal", "count": 3 },
        { "_id": "Visa Application", "count": 2 }
      ],
      "recentApplications": [...]
    }
  }
}
```

### 3. Application Types

#### GET /application-types
Get all application types.

#### POST /application-types
Create new application type (Admin only).

#### PUT /application-types/:id
Update application type (Admin only).

#### DELETE /application-types/:id
Delete application type (Admin only).

### 4. Officers

#### GET /officers
Get all officers.

#### POST /officers
Create new officer (Admin only).

#### PUT /officers/:id
Update officer (Admin only).

#### DELETE /officers/:id
Delete officer (Admin only).

### 5. File Upload

#### POST /files/upload
Upload file to S3.

**Request:**
- Form data with file field
- File size limit: 10MB
- Supported formats: PDF, DOC, DOCX, JPG, PNG

**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://s3.amazonaws.com/bucket/filename.pdf",
    "fileName": "filename.pdf",
    "fileSize": 1024000
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notes

1. **User Creation**: When submitting an application, if a user doesn't exist, one will be created automatically with the provided details (name, address, email, CNIC, phone).

2. **User Updates**: If a user already exists but is missing name or address, these will be updated when they submit a new application.

3. **Authentication**: Most endpoints require a valid JWT token obtained from the login endpoint.

4. **Role-Based Access**: 
   - Regular users can only view their own applications
   - Admin/Superadmin users can view all applications and manage the system

5. **File Uploads**: Files are stored in AWS S3 and the URLs are returned for use in applications. 