# GOAT Backend - Refactored Architecture

## Overview

This document describes the refactored Node.js backend for the GOAT (Government Application Tracking System) following best practices for separation of concerns, modularity, and clean architecture.

## Architecture Overview

The refactored codebase follows a layered architecture pattern:

```
├── controllers/          # Request/Response handling
├── services/            # Business logic layer
├── routes/              # Route definitions
├── middleware/          # Custom middleware
├── models/              # Database models
├── utils/               # Utility functions
├── config/              # Configuration files
└── server.js            # Application entry point
```

## Key Improvements

### 1. Separation of Concerns

**Before**: Business logic was mixed with route handlers
**After**: Clear separation between:
- **Routes**: Only handle HTTP routing and middleware
- **Controllers**: Handle request/response formatting
- **Services**: Contain business logic
- **Models**: Handle data persistence

### 2. Service Layer

Created dedicated service files for business logic:

- `services/authService.js` - Authentication and user management
- `services/adminService.js` - Admin-specific operations

### 3. Controller Layer

Controllers now focus on:
- Request validation
- Response formatting
- Error handling
- Calling appropriate services

### 4. Consistent Error Handling

Implemented standardized error handling with:
- `utils/responseHandler.js` - Centralized response formatting
- Consistent error messages
- Proper HTTP status codes
- Development vs production error details

### 5. Async Handler Pattern

All controllers use the `asyncHandler` wrapper for:
- Automatic error catching
- Consistent error responses
- Cleaner controller code

## File Structure

### Controllers

```
controllers/
├── authController.js    # Authentication operations
├── adminController.js   # Admin operations
└── userController.js    # User operations
```

**Example Controller Pattern:**
```javascript
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  const user = await authService.validateLogin(username, password);
  const token = authService.generateToken(user._id);
  
  return successResponse(res, {
    token,
    user: user.getPublicProfile()
  }, 'Login successful');
});
```

### Services

```
services/
├── authService.js       # Authentication business logic
└── adminService.js      # Admin business logic
```

**Example Service Pattern:**
```javascript
const validateLogin = async (username, password) => {
  const user = await findUserByCredentials(username);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked()) {
    throw new Error('Account is temporarily locked');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};
```

### Routes

Routes are now clean and focused only on:
- HTTP method definitions
- Middleware application
- Controller method calls

**Example Route Pattern:**
```javascript
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/users', authenticateToken, requireAdmin, getUsers);
```

### Response Handler

Centralized response formatting with:

```javascript
// Success responses
successResponse(res, data, message, statusCode)

// Error responses
errorResponse(res, message, statusCode, error)

// Specialized responses
notFoundResponse(res, resource)
unauthorizedResponse(res, message)
forbiddenResponse(res, message)
conflictResponse(res, message)
```

## Benefits of Refactoring

### 1. Maintainability
- Clear separation of responsibilities
- Easier to locate and modify specific functionality
- Reduced code duplication

### 2. Testability
- Business logic isolated in services
- Controllers can be easily unit tested
- Services can be mocked for testing

### 3. Scalability
- New features can be added without affecting existing code
- Services can be reused across different controllers
- Easy to add new layers (e.g., caching, logging)

### 4. Error Handling
- Consistent error responses across the application
- Proper HTTP status codes
- Development-friendly error details

### 5. Code Organization
- Logical file structure
- Clear naming conventions
- Easy to navigate and understand

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /login` - User login
- `POST /register/admin` - Register admin (SuperAdmin only)
- `POST /register/user` - Register user (Admin/SuperAdmin only)
- `GET /me` - Get current user profile
- `GET /users` - Get all users (Admin/SuperAdmin only)
- `PUT /users/:id` - Update user (Admin/SuperAdmin only)
- `DELETE /users/:id` - Deactivate user (Admin/SuperAdmin only)
- `POST /logout` - User logout

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Admin dashboard
- `GET /system-stats` - System statistics (SuperAdmin only)
- `POST /broadcast` - Send system broadcast (SuperAdmin only)
- `GET /audit-log` - Get audit log
- `GET /departments` - Get all departments
- `GET /designations` - Get all designations

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change user password
- `GET /dashboard` - User dashboard
- `GET /notifications` - Get user notifications
- `GET /applications` - Get user applications
- `POST /applications` - Submit new application

## Best Practices Implemented

### 1. Error Handling
- Centralized error handling
- Proper HTTP status codes
- Consistent error message format
- Development vs production error details

### 2. Validation
- Input validation using express-validator
- Consistent validation error responses
- Field-specific error messages

### 3. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Middleware for permission checking

### 4. Response Formatting
- Consistent API response structure
- Standardized success/error formats
- Proper HTTP status codes

### 5. Code Organization
- Clear file structure
- Separation of concerns
- Reusable components
- Clean and readable code

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

3. Start the server:
```bash
npm start
```

4. Access the API:
- Health check: `http://localhost:3000/`
- API docs: `http://localhost:3000/api/docs`

## Future Enhancements

1. **Database Layer**: Add repository pattern for data access
2. **Caching**: Implement Redis for caching
3. **Logging**: Add structured logging
4. **Monitoring**: Add health checks and metrics
5. **Documentation**: Generate API documentation
6. **Testing**: Add comprehensive unit and integration tests

## Conclusion

The refactored codebase now follows Node.js best practices with:
- Clear separation of concerns
- Modular and maintainable code
- Consistent error handling
- Scalable architecture
- Better testability

This structure makes the codebase easier to maintain, extend, and scale as the application grows. 