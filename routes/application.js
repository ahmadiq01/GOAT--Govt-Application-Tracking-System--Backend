const express = require('express');
const { body } = require('express-validator');
const { submitApplication, getApplicationByTrackingNumber } = require('../controllers/applicationController');
const { handleValidationErrors } = require('../middleware/validation');

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
  body('attachments').optional().isArray().withMessage('Attachments must be an array of URLs'),
];

// POST /api/applications - Submit application
router.post('/', submitValidation, handleValidationErrors, submitApplication);

// GET /api/applications/:trackingNumber - Fetch application by tracking number
router.get('/:trackingNumber', getApplicationByTrackingNumber);

module.exports = router;


