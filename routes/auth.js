const express = require('express');
const { loginValidation, handleValidationErrors } = require('../middleware/validation');
const { login } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user (supports all user types)
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

module.exports = router; 