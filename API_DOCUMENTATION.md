# GOAT System API Documentation

## Applications API

### Get All Applications (Basic)
**GET** `/api/applications`

Returns all applications with basic information. Admin/superadmin access required.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `applicationType` (optional): Filter by application type name
- `officer` (optional): Filter by officer name
- `cnic` (optional): Filter by CNIC
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - 'asc' or 'desc' (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {...},
    "statistics": {...}
  }
}
```

### Get All Applications (Comprehensive) ⭐ NEW
**GET** `/api/applications/comprehensive`

Returns the authenticated user's own applications with comprehensive data including:
- Complete user information (based on authentication token)
- Detailed application type data
- Full officer details
- Complete file attachment information

**Security:** Users can only see their own applications based on their NIC from the authentication token.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status
- `applicationType` (optional): Filter by application type name
- `officer` (optional): Filter by officer name
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - 'asc' or 'desc' (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "_id": "...",
        "trackingNumber": "...",
        "name": "...",
        "cnic": "...",
        "phone": "...",
        "email": "...",
        "address": "...",
        "user": {
          "_id": "...",
          "name": "...",
          "email": "...",
          "address": "...",
          "phoneNo": "...",
          "role": "...",
          "department": "...",
          "designation": "..."
        },
        "applicationType": {
          "_id": "...",
          "name": "...",
          "description": "...",
          "requirements": "...",
          "processingTime": "...",
          "fees": "..."
        },
        "officer": {
          "_id": "...",
          "name": "...",
          "designation": "...",
          "department": "...",
          "email": "...",
          "phoneNo": "..."
        },
        "description": "...",
        "attachments": [
          {
            "fileUrl": "...",
            "originalName": "...",
            "fileName": "...",
            "mimeType": "...",
            "size": 12345,
            "uploadDate": "..."
          }
        ],
        "status": "...",
        "acknowledgement": "...",
        "submittedAt": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalApplications": 250,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "statusBreakdown": [...],
      "applicationTypeBreakdown": [...]
    },
    "userInfo": {
      "nic": "...",
      "role": "...",
      "totalApplications": 250
    },
    "comprehensive": true
  }
}
```

**Authentication:** Required (All authenticated users)
**Access Control:** Users can only see their own applications

### Get All Applications (Admin Comprehensive) ⭐ NEW
**GET** `/api/applications/admin/comprehensive`

Returns ALL applications across all users with comprehensive data. Admin/Superadmin access only.

**Security:** Only admin and superadmin users can access this endpoint.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status
- `applicationType` (optional): Filter by application type name
- `officer` (optional): Filter by officer name
- `cnic` (optional): Filter by specific CNIC
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - 'asc' or 'desc' (default: desc)

**Response:** Same structure as above, but includes `"adminAccess": true` and shows all applications across all users.

**Authentication:** Required (Admin/Superadmin only)
**Access Control:** Admins can see all applications across all users

## Feedback API 💬 NEW

The feedback system allows officers to provide feedback to users and users to reply back, creating a conversation thread for each application.

### Create Feedback (Officer to User)
**POST** `/api/feedback`

Officers can create feedback for users on applications assigned to them.

**Request Body:**
```json
{
  "applicationId": "application_id_here",
  "userId": "user_id_here",
  "message": "Your application requires additional documents. Please upload your ID card and address proof.",
  "attachmentUrl": "https://s3.amazonaws.com/bucket/file.pdf",
  "attachment": {
    "originalName": "requirements.pdf",
    "fileName": "requirements_123.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "fileUrl": "https://s3.amazonaws.com/bucket/file.pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback sent successfully",
  "data": {
    "feedback": {
      "_id": "feedback_id",
      "applicationId": "application_id",
      "officerId": "officer_id",
      "userId": "user_id",
      "message": "Your application requires additional documents...",
      "attachment": {...},
      "type": "officer_feedback",
      "threadId": "thread_id",
      "status": "sent",
      "sentAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Authentication:** Required (Officer/Admin/Superadmin only)
**Access Control:** Officers can only provide feedback for applications assigned to them

### Reply to Feedback (User to Officer)
**POST** `/api/feedback/:feedbackId/reply`

Users can reply to officer feedback, creating a conversation thread.

**Request Body:**
```json
{
  "message": "I have uploaded the required documents. Please review them.",
  "attachmentUrl": "https://s3.amazonaws.com/bucket/reply.pdf",
  "attachment": {
    "originalName": "documents.pdf",
    "fileName": "documents_456.pdf",
    "mimeType": "application/pdf",
    "size": 2048000,
    "fileUrl": "https://s3.amazonaws.com/bucket/reply.pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "reply": {
      "_id": "reply_id",
      "applicationId": "application_id",
      "officerId": "officer_id",
      "userId": "user_id",
      "message": "I have uploaded the required documents...",
      "attachment": {...},
      "type": "user_reply",
      "parentFeedbackId": "feedback_id",
      "threadId": "thread_id",
      "status": "sent",
      "sentAt": "2024-01-15T11:00:00Z",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

**Authentication:** Required (User only)
**Access Control:** Users can only reply to feedback intended for them

### Get Application Feedback Thread
**GET** `/api/feedback/application/:applicationId`

Get all feedback and replies for a specific application, organized in conversation threads.

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "_id": "application_id",
      "trackingNumber": "GOAT-2024-001",
      "name": "John Doe"
    },
    "feedbackThreads": [
      {
        "threadId": "thread_id",
        "feedbacks": [
          {
            "_id": "feedback_id",
            "message": "Your application requires additional documents...",
            "type": "officer_feedback",
            "officerId": {
              "name": "Officer Name",
              "designation": "Senior Officer",
              "department": "IT Department"
            },
            "userId": {
              "name": "John Doe",
              "email": "john@example.com"
            },
            "attachment": {...},
            "status": "replied",
            "sentAt": "2024-01-15T10:30:00Z"
          },
          {
            "_id": "reply_id",
            "message": "I have uploaded the required documents...",
            "type": "user_reply",
            "officerId": {...},
            "userId": {...},
            "attachment": {...},
            "status": "sent",
            "sentAt": "2024-01-15T11:00:00Z"
          }
        ],
        "totalMessages": 2,
        "latestMessage": {...}
      }
    ]
  }
}
```

**Authentication:** Required
**Access Control:** Users can only see feedback for their own applications, officers can see feedback for applications assigned to them

### Get User Feedback
**GET** `/api/feedback/user`

Get all feedback received by the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (sent, read, replied)

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbacks": [...],
    "pagination": {...},
    "unreadCount": 3
  }
}
```

**Authentication:** Required (User only)
**Access Control:** Users can only see their own feedback

### Get Officer Feedback
**GET** `/api/feedback/officer`

Get all feedback sent by the authenticated officer.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `applicationId` (optional): Filter by specific application

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbacks": [...],
    "pagination": {...},
    "pendingRepliesCount": 2
  }
}
```

**Authentication:** Required (Officer/Admin/Superadmin only)
**Access Control:** Officers can only see feedback they sent

### Mark Feedback as Read
**PUT** `/api/feedback/:feedbackId/read`

Mark a specific feedback message as read.

**Response:**
```json
{
  "success": true,
  "message": "Feedback marked as read successfully"
}
```

**Authentication:** Required
**Access Control:** Users can only mark their own feedback as read, officers can only mark their own feedback as read

### Delete Feedback
**DELETE** `/api/feedback/:feedbackId`

Delete a feedback message (only if it has no replies).

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

**Authentication:** Required
**Access Control:** Users can only delete their own replies, officers can only delete their own feedback

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

#### GET /api/applications/user/:cnic/summary
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

#### GET /api/applications/user/details/:cnic
Get user details by CNIC (public endpoint, no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "Full Name": "John Doe",
    "Existing User": "Yes",
    "CNIC Number": "12345-1234567-1",
    "Mobile Number": "0300-1234567",
    "Email Address": "john@example.com",
    "Complete Address": "123 Main Street, City",
    "Total Applications": 5,
    "User ID": "user-id",
    "Role": "user",
    "Created At": "2024-01-01T00:00:00.000Z",
    "Last Updated": "2024-01-01T00:00:00.000Z"
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

3. **Authentication**: Most endpoints require a valid JWT token obtained from the login endpoint, except for the user details endpoint which is publicly accessible.

4. **Role-Based Access**: 
   - Regular users can only view their own applications
   - Admin/Superadmin users can view all applications and manage the system
   - User details endpoint is publicly accessible for quick user lookups

5. **File Uploads**: Files are stored in AWS S3 and the URLs are returned for use in applications. 