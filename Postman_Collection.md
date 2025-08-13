# GOAT API - Postman Collection

## 🚀 Quick Setup

### Base URL
```
http://localhost:3000
```

### Environment Variables
Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:3000`
- `token`: (will be set after login)

## 📋 API Endpoints

### 1. Authentication

#### 🔐 Login SuperAdmin
**POST** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "superadmin",
  "password": "SuperAdmin123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "username": "superadmin",
      "email": "superadmin@goat.gov.pk",
      "nic": "1234567890123",
      "phoneNo": "+92-300-1234567",
      "role": "superadmin",
      "department": "System Administration",
      "designation": "Super Administrator",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 🔐 Login Admin
**POST** `{{base_url}}/api/auth/login`

**Body:**
```json
{
  "username": "admin1",
  "password": "Admin123!"
}
```

#### 🔐 Login User
**POST** `{{base_url}}/api/auth/login`

**Body:**
```json
{
  "username": "1234567890127",
  "password": "+92-300-1234571"
}
```

#### 🔐 Login with Email
**POST** `{{base_url}}/api/auth/login`

**Body:**
```json
{
  "username": "superadmin@goat.gov.pk",
  "password": "SuperAdmin123!"
}
```

#### 🔐 Login with NIC
**POST** `{{base_url}}/api/auth/login`

**Body:**
```json
{
  "username": "1234567890123",
  "password": "SuperAdmin123!"
}
```

#### 🔐 Login with CNIC and Phone
**POST** `{{base_url}}/api/auth/login`

**Body:**
```json
{
  "username": "35202-1234567-8",
  "password": "03001234567"
}
```

### 2. Admin Registration (SuperAdmin Only)

#### 👨‍💼 Register New Admin
**POST** `{{base_url}}/api/auth/register/admin`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@goat.gov.pk",
  "nic": "1234567890132",
  "phoneNo": "+92-300-1234576",
  "department": "IT Department",
  "designation": "Network Administrator",
  "password": "NewAdmin123!"
}
```

### 3. User Registration (Admin/SuperAdmin Only)

#### 👤 Register New User
**POST** `{{base_url}}/api/auth/register/user`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "nic": "1234567890133",
  "phoneNo": "+92-300-1234577",
  "email": "newuser@example.com"
}
```

### 4. User Management

#### 📋 Get All Users
**GET** `{{base_url}}/api/auth/users`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `page`: 1 (optional)
- `limit`: 10 (optional)
- `role`: user/admin/superadmin (optional)
- `search`: search term (optional)

#### 📋 Get All Users with Filters
**GET** `{{base_url}}/api/auth/users?role=user&page=1&limit=5&search=1234567890127`

#### 👤 Update User
**PUT** `{{base_url}}/api/auth/users/{{user_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "email": "updated@example.com",
  "phoneNo": "+92-300-1234578"
}
```

#### 🚫 Deactivate User
**DELETE** `{{base_url}}/api/auth/users/{{user_id}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 5. Profile Management

#### 👤 Get My Profile
**GET** `{{base_url}}/api/auth/me`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 👤 Get User Profile
**GET** `{{base_url}}/api/user/profile`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### ✏️ Update Profile
**PUT** `{{base_url}}/api/user/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "email": "newemail@example.com",
  "phoneNo": "+92-300-1234579"
}
```

#### 🔐 Change Password
**PUT** `{{base_url}}/api/user/change-password`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "currentPassword": "SuperAdmin123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### 6. Admin Dashboard

#### 📊 Get Admin Dashboard
**GET** `{{base_url}}/api/admin/dashboard`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 📈 Get System Statistics (SuperAdmin Only)
**GET** `{{base_url}}/api/admin/system-stats`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 📢 Send Broadcast (SuperAdmin Only)
**POST** `{{base_url}}/api/admin/broadcast`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "message": "System maintenance scheduled for tomorrow at 2 AM",
  "targetRole": "user"
}
```

#### 📋 Get Audit Log
**GET** `{{base_url}}/api/admin/audit-log`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `page`: 1 (optional)
- `limit`: 20 (optional)

#### 🏢 Get Departments
**GET** `{{base_url}}/api/admin/departments`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 👔 Get Designations
**GET** `{{base_url}}/api/admin/designations`

**Headers:**
```
Authorization: Bearer {{token}}
```

### 7. User Dashboard

#### 🏠 Get User Dashboard
**GET** `{{base_url}}/api/user/dashboard`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 🔔 Get Notifications
**GET** `{{base_url}}/api/user/notifications`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 📝 Submit Application
**POST** `{{base_url}}/api/applications`

**Note:** The `trackingNumber` field is now required and must be provided by the frontend. The backend no longer generates tracking numbers automatically.

**Tracking Number Format:** The tracking number should follow the format `GOAT-{timestamp}-{random4digit}` (e.g., `GOAT-1723224233-7342`). You can use the utility function provided in `utils/trackingNumberGenerator.js` to generate tracking numbers in the correct format.

**Headers:**
```
Content-Type: application/json
```

**Body (example):**
```json
{
  "trackingNumber": "GOAT-1723224233-7342",
  "name": "Ahmad Iqbal",
  "cnic": "35202-1234567-8",
  "phone": "03001234567",
  "email": "ahmad@example.com",
  "address": "123 Main Street",
  "applicationType": "Revenue matters",
  "officer": "Deputy Commissioner Office",
  "description": "Need a new electricity connection for my house.",
  "attachments": [
    "https://your-bucket.s3.amazonaws.com/doc1.pdf",
    "https://your-bucket.s3.amazonaws.com/doc2.jpg"
  ]
}
```

You can also pass IDs instead of names for `applicationType` and `officer`:

```json
{
  "trackingNumber": "GOAT-1723224233-7342",
  "name": "Ahmad Iqbal",
  "cnic": "35202-1234567-8",
  "phone": "03001234567",
  "applicationType": "65f2d0c2a6c1f12a34b56789",
  "officer": "65f2d114a6c1f12a34b5678a"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully.",
  "data": {
    "trackingNumber": "GOAT-1723224233-7342",
    "name": "Ahmad Iqbal",
    "cnic": "35202-1234567-8",
    "phone": "03001234567",
    "email": "ahmad@example.com",
    "address": "123 Main Street",
    "applicationType": "Electricity Connection",
    "description": "Need a new electricity connection for my house.",
    "attachments": [
      "https://<bucket>.s3.<region>.amazonaws.com/applications/35202-1234567-8/1691590000-1234.pdf"
    ],
    "acknowledgement": "Received",
    "status": "Submitted",
    "submittedAt": "2025-08-09T20:34:01.123Z"
  }
}
```

#### 🔎 Get Application by Tracking Number
**GET** `{{base_url}}/api/applications/{{trackingNumber}}`

No auth required.

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "trackingNumber": "GOAT-1723224233-7342",
    "name": "Ahmad Iqbal",
    "cnic": "35202-1234567-8",
    "phone": "03001234567",
    "email": "ahmad@example.com",
    "address": "123 Main Street",
    "applicationType": "Electricity Connection",
    "description": "Need a new electricity connection for my house.",
    "attachments": [
      "https://<bucket>.s3.<region>.amazonaws.com/applications/35202-1234567-8/1691590000-1234.pdf"
    ],
    "acknowledgement": "Received",
    "status": "Submitted",
    "submittedAt": "2025-08-09T20:34:01.123Z"
  }
}
```

### 8. Logout

#### 🚪 Logout
**POST** `{{base_url}}/api/auth/logout`

**Headers:**
```
Authorization: Bearer {{token}}
```

## 🧪 Test Data Summary

### SuperAdmin
- **Username**: `superadmin`
- **Email**: `superadmin@goat.gov.pk`
- **Password**: `SuperAdmin123!`
- **NIC**: `1234567890123`

### Admins
1. **admin1** - Password: `Admin123!` - IT Department
2. **admin2** - Password: `Admin123!` - HR Department
3. **admin3** - Password: `Admin123!` - Finance Department

### Users (Login with NIC as username, phone as password)
1. **NIC**: `1234567890127` - **Password**: `+92-300-1234571`
2. **NIC**: `1234567890128` - **Password**: `+92-300-1234572`
3. **NIC**: `1234567890129` - **Password**: `+92-300-1234573`
4. **NIC**: `1234567890130` - **Password**: `+92-300-1234574`
5. **NIC**: `1234567890131` - **Password**: `+92-300-1234575`

## 🔄 Postman Tests

### Auto-set Token
Add this test script to login requests:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("token", response.data.token);
    }
}
```

### Check Success Response
```javascript
pm.test("Response is successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
});
```

### Check Authentication
```javascript
pm.test("User is authenticated", function () {
    const response = pm.response.json();
    pm.expect(response.data.user).to.have.property('role');
    pm.expect(response.data.user).to.have.property('username');
});
```

## 🚀 Quick Test Flow

1. **Login as SuperAdmin** → Get token
2. **Get Admin Dashboard** → Check system stats
3. **Register New Admin** → Create admin user
4. **Login as New Admin** → Test admin access
5. **Register New User** → Create regular user
6. **Login as New User** → Test user access
7. **Submit Application** → Test user functionality

## 📝 Notes

- All passwords should be changed after first login
- Users can login with username, email, or NIC
- Admin/SuperAdmin can manage users based on role permissions
- JWT tokens expire after 24 hours
- Account gets locked after 5 failed login attempts 