const authService = require('../services/authService');
const User = require('../models/User');
const { 
  successResponse, 
  errorResponse, 
  asyncHandler
} = require('../utils/responseHandler');

// @desc    Login user
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await authService.validateLogin(username, password);
    const token = authService.generateToken(user._id);

    return successResponse(res, {
      token,
      user: user.getPublicProfile()
    }, 'Login successful');
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    if (error.message.includes('locked')) {
      return errorResponse(res, error.message, 423);
    }
    throw error;
  }
});

module.exports = {
  login
}; 