const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireUser } = require('../middleware/auth');
const {
  userProfileUpdateValidation,
  passwordChangeValidation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
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

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  authenticateToken, 
  userProfileUpdateValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { email, phoneNo } = req.body;
      const updateData = {};

      if (email) updateData.email = email;
      if (phoneNo) updateData.phoneNo = phoneNo;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -loginAttempts -lockUntil');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.getPublicProfile()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
);

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', 
  authenticateToken, 
  passwordChangeValidation, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
);

// @route   GET /api/user/dashboard
// @desc    Get user dashboard
// @access  Private
router.get('/dashboard', authenticateToken, requireUser, async (req, res) => {
  try {
    // Get user's basic info and stats
    const userStats = {
      lastLogin: req.user.lastLogin,
      accountCreated: req.user.createdAt,
      isActive: req.user.isActive
    };

    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile(),
        stats: userStats
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard'
    });
  }
});

// @route   GET /api/user/notifications
// @desc    Get user notifications (placeholder)
// @access  Private
router.get('/notifications', authenticateToken, requireUser, async (req, res) => {
  try {
    // Placeholder for notifications
    const notifications = [
      {
        id: 1,
        title: 'Welcome to GOAT System',
        message: 'Thank you for registering with our system.',
        type: 'info',
        createdAt: new Date(),
        isRead: false
      }
    ];

    res.json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications'
    });
  }
});

// @route   GET /api/user/applications
// @desc    Get user applications (placeholder)
// @access  Private
router.get('/applications', authenticateToken, requireUser, async (req, res) => {
  try {
    // Placeholder for applications
    const applications = [
      {
        id: 1,
        title: 'Sample Application',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: {
        applications
      }
    });
  } catch (error) {
    console.error('Applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load applications'
    });
  }
});

// @route   POST /api/user/applications
// @desc    Submit new application (placeholder)
// @access  Private
router.post('/applications', authenticateToken, requireUser, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Placeholder for application creation
    const newApplication = {
      id: Date.now(),
      title,
      description,
      category: category || 'general',
      status: 'pending',
      userId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: newApplication
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

module.exports = router; 