const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin/SuperAdmin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    // Get recent users
    const recentUsers = await User.find({ role: 'user' })
      .select('username email nic phoneNo createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get system statistics
    const systemStats = {
      totalUsers,
      totalAdmins,
      activeUsers,
      activeAdmins,
      inactiveUsers: totalUsers - activeUsers,
      inactiveAdmins: totalAdmins - activeAdmins
    };

    res.json({
      success: true,
      data: {
        systemStats,
        recentUsers,
        userRole: req.user.role
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard'
    });
  }
});

// @route   GET /api/admin/system-stats
// @desc    Get detailed system statistics (SuperAdmin only)
// @access  Private (SuperAdmin)
router.get('/system-stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Get detailed statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactiveCount: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get users who logged in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogins = await User.countDocuments({
      lastLogin: { $gte: today }
    });

    const formattedStats = {
      byRole: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.count,
          active: stat.activeCount,
          inactive: stat.inactiveCount
        };
        return acc;
      }, {}),
      recentRegistrations,
      todayLogins,
      totalUsers: stats.reduce((sum, stat) => sum + stat.count, 0)
    };

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load system statistics'
    });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send system broadcast (SuperAdmin only)
// @access  Private (SuperAdmin)
router.post('/broadcast', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { message, targetRole } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Broadcast message is required'
      });
    }

    // Here you would typically send notifications to users
    // For now, we'll just return success
    const query = targetRole ? { role: targetRole } : {};
    const affectedUsers = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Broadcast sent successfully',
      data: {
        message,
        targetRole: targetRole || 'all',
        affectedUsers
      }
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast'
    });
  }
});

// @route   GET /api/admin/audit-log
// @desc    Get audit log (Admin/SuperAdmin)
// @access  Private (Admin/SuperAdmin)
router.get('/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get users with their last activity
    const auditLog = await User.find({})
      .select('username email role lastLogin createdAt isActive')
      .sort({ lastLogin: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({});

    res.json({
      success: true,
      data: {
        auditLog,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load audit log'
    });
  }
});

// @route   GET /api/admin/departments
// @desc    Get all departments (Admin/SuperAdmin)
// @access  Private (Admin/SuperAdmin)
router.get('/departments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const departments = await User.distinct('department', {
      department: { $exists: true, $ne: null }
    });

    res.json({
      success: true,
      data: {
        departments
      }
    });
  } catch (error) {
    console.error('Departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load departments'
    });
  }
});

// @route   GET /api/admin/designations
// @desc    Get all designations (Admin/SuperAdmin)
// @access  Private (Admin/SuperAdmin)
router.get('/designations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const designations = await User.distinct('designation', {
      designation: { $exists: true, $ne: null }
    });

    res.json({
      success: true,
      data: {
        designations
      }
    });
  } catch (error) {
    console.error('Designations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load designations'
    });
  }
});

module.exports = router; 