const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GOAT - Government Application Tracking System API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      user: '/api/user'
    }
  });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'GOAT API Documentation',
    endpoints: {
      'Authentication': {
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/register': 'Register new user (Admin/SuperAdmin only)',
        'GET /api/auth/me': 'Get current user profile',
        'GET /api/auth/users': 'Get all users (Admin/SuperAdmin only)',
        'PUT /api/auth/users/:id': 'Update user (Admin/SuperAdmin only)'
      },
      'Admin Routes': {
        'GET /api/admin/dashboard': 'Admin dashboard (Admin/SuperAdmin)',
        'GET /api/admin/system-stats': 'System statistics (SuperAdmin only)',
        'POST /api/admin/broadcast': 'Send system broadcast (SuperAdmin only)',
        'GET /api/admin/audit-log': 'Get audit log (Admin/SuperAdmin)'
      },
      'User Routes': {
        'GET /api/user/profile': 'Get user profile',
        'PUT /api/user/profile': 'Update user profile',
        'GET /api/user/applications': 'Get user applications',
        'POST /api/user/applications': 'Submit new application',
        'GET /api/user/notifications': 'Get user notifications',
        'GET /api/user/dashboard': 'User dashboard'
      }
    },
    roles: {
      'superadmin': 'Full system access',
      'admin': 'User management and admin features',
      'user': 'Basic user features'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GOAT Backend Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/`);
}); 