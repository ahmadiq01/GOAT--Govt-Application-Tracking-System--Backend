const express = require('express');
const { body } = require('express-validator');
const { 
  createFeedback,
  replyToFeedback,
  getApplicationFeedback,
  getUserFeedback,
  getOfficerFeedback,
  markFeedbackAsRead,
  deleteFeedback
} = require('../controllers/feedbackController');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation for feedback creation
const feedbackValidation = [
  body('applicationId').isMongoId().withMessage('Valid application ID is required'),
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('message').notEmpty().trim().withMessage('Message is required'),
  body('attachmentUrl').optional().isURL().withMessage('Attachment URL must be valid'),
  body('attachment').optional().isObject().withMessage('Attachment must be an object')
];

// Validation for feedback reply
const replyValidation = [
  body('message').notEmpty().trim().withMessage('Message is required'),
  body('attachmentUrl').optional().isURL().withMessage('Attachment URL must be valid'),
  body('attachment').optional().isObject().withMessage('Attachment must be an object')
];

// POST /api/feedback - Officer creates feedback for user
router.post('/', authenticateToken, feedbackValidation, handleValidationErrors, createFeedback);

// POST /api/feedback/:feedbackId/reply - User replies to officer feedback
router.post('/:feedbackId/reply', authenticateToken, replyValidation, handleValidationErrors, replyToFeedback);

// GET /api/feedback/application/:applicationId - Get all feedback for a specific application
router.get('/application/:applicationId', authenticateToken, getApplicationFeedback);

// GET /api/feedback/user - Get all feedback for the authenticated user
router.get('/user', authenticateToken, getUserFeedback);

// GET /api/feedback/officer - Get all feedback for the authenticated officer
router.get('/officer', authenticateToken, getOfficerFeedback);

// PUT /api/feedback/:feedbackId/read - Mark feedback as read
router.put('/:feedbackId/read', authenticateToken, markFeedbackAsRead);

// DELETE /api/feedback/:feedbackId - Delete feedback (only by creator)
router.delete('/:feedbackId', authenticateToken, deleteFeedback);

module.exports = router;
