const express = require('express');
const { body } = require('express-validator');
const { 
  submitApplication, 
  getApplicationByTrackingNumber, 
  getUserApplications, 
  getUserApplicationsSummary,
  getAllApplications,
  getAllApplicationsComprehensive,
  getAllApplicationsAdminComprehensive,
  getUserDetails
} = require('../controllers/applicationController');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation for application submission
const submitValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('cnic').notEmpty().withMessage('CNIC is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  // applicationType can be ObjectId or name
  body('applicationType').notEmpty().withMessage('Application type is required'),
  // officer optional; can be ObjectId or name
  body('officer').optional(),
  body('attachments').optional().isArray().withMessage('Attachments must be an array of S3 URLs'),
  body('attachments.*').optional().isURL().withMessage('Each attachment must be a valid S3 URL'),
];

// POST /api/applications - Submit application
router.post('/', submitValidation, handleValidationErrors, submitApplication);

// GET /api/applications - Get all applications (admin/superadmin only)
router.get('/', authenticateToken, getAllApplications);

// GET /api/applications/comprehensive - Get all applications with comprehensive data
router.get('/comprehensive', authenticateToken, getAllApplicationsComprehensive);

// GET /api/applications/admin/comprehensive - Get ALL applications with comprehensive data (Admin/Superadmin only)
router.get('/admin/comprehensive', authenticateToken, getAllApplicationsAdminComprehensive);

// GET /api/applications/:trackingNumber - Fetch application by tracking number
router.get('/:trackingNumber', getApplicationByTrackingNumber);

// GET /api/applications/user/:cnic - Fetch user details with all applications
router.get('/user/:cnic', authenticateToken, getUserApplications);

// GET /api/applications/user/:cnic/summary - Fetch user applications summary
router.get('/user/:cnic/summary', authenticateToken, getUserApplicationsSummary);

// GET /api/applications/user/details/:cnic - Fetch user details by CNIC
router.get('/user/details/:cnic', getUserDetails);

module.exports = router;


