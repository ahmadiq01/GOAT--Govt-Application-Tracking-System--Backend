# File Upload API Documentation

## Overview
The File Upload API allows you to upload files to S3 before submitting an application.

## Endpoints

### 1. Upload Files
**POST** `/api/files/upload`

Upload single or multiple files to S3 and get back S3 URLs.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `files`: File(s) to upload
  - `applicationTrackingNumber`: The tracking number for organizing files

#### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -F "files=@document.pdf" \
  -F "applicationTrackingNumber=GOAT-1234567890-1234"
```

#### Response
```json
{
  "success": true,
  "data": {
    "s3Urls": [
      "https://goat-bucket-project.s3.eu-north-1.amazonaws.com/applications/GOAT-1234567890-1234/uuid1.pdf"
    ]
  }
}
```

## Updated Application Submission Flow

### Step 1: Upload Files
1. Upload files using `/api/files/upload`
2. Get back S3 URLs in the response

### Step 2: Submit Application
1. Use the S3 URLs in the `attachments` array when submitting the application
2. The application API now validates that all attachments are valid S3 URLs

## File Organization
Files are organized in S3 with the following structure:
```
applications/
├── GOAT-1234567890-1234/
│   ├── uuid1.pdf
│   └── uuid2.jpg
```

## Benefits
1. **Separation of Concerns**: File handling is separate from application logic
2. **Better Organization**: Files are organized by application tracking number
3. **Reliability**: No more "false URLs mixed with strings" issues
4. **Validation**: Proper S3 URL validation before application submission
