const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorResponse } = require('./utils/responseHandler');

// Import routes
const authRoutes = require('./routes/auth');
const applicationTypeRoutes = require('./routes/applicationType');
const officerRoutes = require('./routes/officer');

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
app.use('/api/application-types', applicationTypeRoutes);
app.use('/api/officers', officerRoutes);

// 404 handler
app.use('*', (req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return errorResponse(res, 'Something went wrong!', 500, err);
});

app.listen(PORT, () => {
  console.log(`🚀 GOAT Backend Server is running on port ${PORT}`);
  console.log(`🔗 Login API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Application Types API: http://localhost:${PORT}/api/application-types`);
  console.log(`👥 Officers API: http://localhost:${PORT}/api/officers`);
}); 