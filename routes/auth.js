const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireSuperAdmin, 
  requireAdmin, 
  canManageUser 
} = require('../middleware/auth');
const {
  loginValidation,
  adminRegistrationValidation,
  userRegistrationValidation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// @route   POST /api/auth/login
// @desc    Login user (supports all user types)
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username, email, or NIC
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username },
        { nic: username }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @route   POST /api/auth/register/admin
// @desc    Register new admin (SuperAdmin only)
// @access  Private (SuperAdmin)
router.post('/register/admin', 
  authenticateToken, 
  requireSuperAdmin, 
  adminRegistrationValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { username, email, nic, phoneNo, department, designation, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username },
          { email },
          { nic }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this username, email, or NIC already exists'
        });
      }

      // Create new admin
      const admin = new User({
        username,
        email,
        nic,
        phoneNo,
        department,
        designation,
        password,
        role: 'admin'
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          user: admin.getPublicProfile()
        }
      });
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Admin registration failed'
      });
    }
  }
);

// @route   POST /api/auth/register/user
// @desc    Register new user (Admin/SuperAdmin only)
// @access  Private (Admin/SuperAdmin)
router.post('/register/user', 
  authenticateToken, 
  requireAdmin, 
  userRegistrationValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { nic, phoneNo, email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { nic },
          { email: email || '' }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this NIC or email already exists'
        });
      }

      // Create new user (NIC as username, phone as password)
      const user = new User({
        username: nic, // NIC as username
        email: email || '',
        nic,
        phoneNo,
        password: phoneNo, // Phone number as password
        role: 'user'
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.getPublicProfile()
        }
      });
    } catch (error) {
      console.error('User registration error:', error);
      res.status(500).json({
        success: false,
        message: 'User registration failed'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin/SuperAdmin only)
// @access  Private (Admin/SuperAdmin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    
    // Filter by role if specified
    if (role) {
      query.role = role;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user (Admin/SuperAdmin only)
// @access  Private (Admin/SuperAdmin)
router.put('/users/:id', 
  authenticateToken, 
  requireAdmin, 
  canManageUser, 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields from update
      delete updateData.password;
      delete updateData.role;
      delete updateData.loginAttempts;
      delete updateData.lockUntil;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -loginAttempts -lockUntil');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

// @route   DELETE /api/auth/users/:id
// @desc    Deactivate user (Admin/SuperAdmin only)
// @access  Private (Admin/SuperAdmin)
router.delete('/users/:id', 
  authenticateToken, 
  requireAdmin, 
  canManageUser, 
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      ).select('-password -loginAttempts -lockUntil');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update last login time for audit
    await User.findByIdAndUpdate(req.user._id, {
      lastLogin: new Date()
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router; 