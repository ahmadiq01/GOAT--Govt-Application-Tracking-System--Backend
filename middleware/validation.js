const { body, validationResult } = require('express-validator');

// Validation rules for login
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Validation rules for admin registration
const adminRegistrationValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('nic')
    .notEmpty()
    .withMessage('NIC is required')
    .isLength({ min: 13, max: 15 })
    .withMessage('NIC must be between 13-15 characters')
    .trim(),
  body('phoneNo')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .trim(),
  body('designation')
    .notEmpty()
    .withMessage('Designation is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for user registration (NIC as username, phone as password)
const userRegistrationValidation = [
  body('nic')
    .notEmpty()
    .withMessage('NIC is required')
    .isLength({ min: 13, max: 15 })
    .withMessage('NIC must be between 13-15 characters')
    .trim(),
  body('phoneNo')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// Validation rules for user profile update
const userProfileUpdateValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phoneNo')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number')
    .trim()
];

// Validation rules for admin profile update
const adminProfileUpdateValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phoneNo')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('designation')
    .optional()
    .trim()
];

// Validation rules for password change
const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

const validateFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided. Please select at least one file to upload.'
    });
  }
  next();
};

module.exports = {
  loginValidation,
  adminRegistrationValidation,
  userRegistrationValidation,
  userProfileUpdateValidation,
  adminProfileUpdateValidation,
  passwordChangeValidation,
  validateFiles,
  handleValidationErrors
}; 