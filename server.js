const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorResponse } = require('./utils/responseHandler');

// Import routes
const authRoutes = require('./routes/auth');
const applicationTypeRoutes = require('./routes/applicationType');
const applicationRoutes = require('./routes/application');
const officerRoutes = require('./routes/officer');
const fileRoutes = require('./routes/fileRoutes');
const feedbackRoutes = require('./routes/feedback');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application-types', applicationTypeRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GOAT Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File size too large. Maximum allowed size is 10MB.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return errorResponse(res, 'Too many files. Maximum 10 files allowed.', 400);
  }

  // File type errors
  if (err.message && err.message.includes('Invalid file type')) {
    return errorResponse(res, err.message, 400);
  }

  // Default error
  console.error(err.stack);
  return errorResponse(res, 'Something went wrong!', 500, err);
});

app.listen(PORT, () => {
  console.log(`🚀 GOAT Backend Server is running on port ${PORT}`);
  console.log(`🔗 Login API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Application Types API: http://localhost:${PORT}/api/application-types`);
  console.log(`👥 Officers API: http://localhost:${PORT}/api/officers`);
  console.log(`📝 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`📁 Files API: http://localhost:${PORT}/api/files`);
  console.log(`💬 Feedback API: http://localhost:${PORT}/api/feedback`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
