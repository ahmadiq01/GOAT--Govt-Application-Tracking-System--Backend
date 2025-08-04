# GOAT - Government Application Tracking System Backend

A comprehensive Node.js/Express.js backend system with role-based authentication for government application tracking.

## 🏗️ System Architecture

### User Types
1. **SuperAdmin** - Full system access and control
2. **Admin** - User management and administrative functions
3. **User** - Basic user with application submission capabilities

### Authentication Flow
- **SuperAdmin**: Created via seeder, manages admins
- **Admin**: Created by SuperAdmin, manages users
- **User**: Created by Admin/SuperAdmin, uses NIC as username and phone as password

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Start MongoDB (if local)
mongod

# Run the seeder to create SuperAdmin
npm run seed
```

4. **Start the Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/login` | Login user (all types) | Public |
| POST | `/register/admin` | Register new admin | SuperAdmin |
| POST | `/register/user` | Register new user | Admin/SuperAdmin |
| GET | `/me` | Get current user profile | Private |
| GET | `/users` | Get all users | Admin/SuperAdmin |
| PUT | `/users/:id` | Update user | Admin/SuperAdmin |
| DELETE | `/users/:id` | Deactivate user | Admin/SuperAdmin |
| POST | `/logout` | Logout user | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Admin dashboard | Admin/SuperAdmin |
| GET | `/system-stats` | System statistics | SuperAdmin |
| POST | `/broadcast` | Send system broadcast | SuperAdmin |
| GET | `/audit-log` | Get audit log | Admin/SuperAdmin |
| GET | `/departments` | Get all departments | Admin/SuperAdmin |
| GET | `/designations` | Get all designations | Admin/SuperAdmin |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| GET | `/dashboard` | User dashboard | Private |
| GET | `/notifications` | Get notifications | Private |
| GET | `/applications` | Get applications | Private |
| POST | `/applications` | Submit application | Private |

## 🔐 Authentication

### Login Credentials

#### SuperAdmin (Created by Seeder)
- **Username**: `superadmin`
- **Email**: `superadmin@goat.gov.pk`
- **Password**: `SuperAdmin123!`
- **NIC**: `1234567890123`
- **Phone**: `+92-300-1234567`

#### Admin (Created by SuperAdmin)
- **Username**: Custom
- **Email**: Required
- **Password**: Custom (min 6 chars, with uppercase, lowercase, number)
- **NIC**: Required (13-15 chars)
- **Phone**: Required
- **Department**: Required
- **Designation**: Required

#### User (Created by Admin/SuperAdmin)
- **Username**: NIC number
- **Password**: Phone number
- **Email**: Optional
- **NIC**: Required (13-15 chars)
- **Phone**: Required

### JWT Token
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: 24 hours
- **Secret**: Configured in `.env`

## 🛡️ Security Features

### Account Protection
- **Password Hashing**: bcryptjs with salt rounds
- **Account Locking**: After 5 failed attempts (2 hours)
- **Input Validation**: Comprehensive validation for all inputs
- **Role-based Access**: Granular permissions per endpoint

### Data Validation
- **Email**: Valid email format
- **NIC**: 13-15 characters
- **Phone**: Valid phone number format
- **Password**: Minimum 6 characters with complexity requirements

## 📊 Database Schema

### User Model
```javascript
{
  username: String,        // Unique, required
  email: String,           // Unique, required
  nic: String,             // Unique, required (13-15 chars)
  phoneNo: String,         // Required
  password: String,        // Hashed, required
  role: String,            // 'superadmin' | 'admin' | 'user'
  department: String,      // Required for admin/superadmin
  designation: String,     // Required for admin/superadmin
  isActive: Boolean,       // Default: true
  lastLogin: Date,         // Updated on login
  loginAttempts: Number,   // Failed login counter
  lockUntil: Date,         // Account lock timestamp
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/goat-system

# Security
JWT_SECRET=your-super-secret-jwt-key
```

## 🧪 Testing

### 🚀 Quick Test Setup

1. **Run the seeder to create test data:**
```bash
npm run seed
```

2. **Start the server:**
```bash
npm run dev
```

### 📋 Test Data Created by Seeder

#### 🔐 SuperAdmin
- **Username**: `superadmin`
- **Email**: `superadmin@goat.gov.pk`
- **Password**: `SuperAdmin123!`
- **NIC**: `1234567890123`
- **Phone**: `+92-300-1234567`

#### 👨‍💼 Admins (3 created)
1. **admin1** - Password: `Admin123!` - IT Department
2. **admin2** - Password: `Admin123!` - HR Department  
3. **admin3** - Password: `Admin123!` - Finance Department

#### 👤 Users (5 created - Login with NIC as username, phone as password)
1. **NIC**: `1234567890127` - **Password**: `+92-300-1234571`
2. **NIC**: `1234567890128` - **Password**: `+92-300-1234572`
3. **NIC**: `1234567890129` - **Password**: `+92-300-1234573`
4. **NIC**: `1234567890130` - **Password**: `+92-300-1234574`
5. **NIC**: `1234567890131` - **Password**: `+92-300-1234575`

### 📱 Postman Collection

**Complete Postman documentation available in:** `Postman_Collection.md`

#### 🔐 Login SuperAdmin (Postman Body)
```json
{
  "username": "superadmin",
  "password": "SuperAdmin123!"
}
```

#### 🔐 Login Admin (Postman Body)
```json
{
  "username": "admin1",
  "password": "Admin123!"
}
```

#### 🔐 Login User (Postman Body)
```json
{
  "username": "1234567890127",
  "password": "+92-300-1234571"
}
```

### API Testing with cURL

#### Login as SuperAdmin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SuperAdmin123!"
  }'
```

#### Register Admin (with token)
```bash
curl -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "admin1",
    "email": "admin1@goat.gov.pk",
    "nic": "1234567890124",
    "phoneNo": "+92-300-1234568",
    "department": "IT Department",
    "designation": "System Administrator",
    "password": "Admin123!"
  }'
```

#### Register User (with token)
```bash
curl -X POST http://localhost:3000/api/auth/register/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nic": "1234567890125",
    "phoneNo": "+92-300-1234569",
    "email": "user1@example.com"
  }'
```

## 📝 Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run database seeder
npm run seed
```

## 🏛️ Government Application Form Integration

The system is designed to work with government application forms that include:

### Form Fields
- **Full Name** → Maps to `username` or `name`
- **CNIC Number** → Maps to `nic` field
- **Mobile Number** → Maps to `phoneNo` field
- **Email Address** → Maps to `email` field
- **Complete Address** → Can be added to user profile
- **Complaint Category** → Can be used for application categorization
- **Supporting Documents** → Can be integrated with file upload system

### User Registration Flow
1. **SuperAdmin** creates **Admin** users
2. **Admin** creates **User** accounts using NIC as username and phone as password
3. **Users** can login with their NIC number and phone number
4. **Users** can submit applications and track their status

## 🔄 Future Enhancements

- [ ] File upload system for supporting documents
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Application tracking system
- [ ] Audit logging
- [ ] API rate limiting
- [ ] Two-factor authentication
- [ ] Password reset functionality

## 📞 Support

For technical support or questions about the GOAT system, please contact the development team.

---

**GOAT - Government Application Tracking System**  
*Empowering Government Services Through Technology* 