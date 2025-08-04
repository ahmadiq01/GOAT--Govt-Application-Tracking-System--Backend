const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Specific role middleware
const requireSuperAdmin = requireRole('superadmin');
const requireAdmin = requireRole('superadmin', 'admin');
const requireUser = requireRole('superadmin', 'admin', 'user');

// Middleware to check if user can manage other users
const canManageUser = (req, res, next) => {
  const targetUserId = req.params.id || req.body.userId;
  
  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: 'User ID required'
    });
  }

  // SuperAdmin can manage anyone
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Admin can only manage users (not other admins or superadmins)
  if (req.user.role === 'admin') {
    User.findById(targetUserId).then(targetUser => {
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Target user not found'
        });
      }
      
      if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Admins can only manage regular users'
        });
      }
      
      next();
    }).catch(err => {
      return res.status(500).json({
        success: false,
        message: 'Error checking user permissions'
      });
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  requireUser,
  canManageUser
}; 