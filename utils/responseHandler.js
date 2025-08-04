// Success response handler
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response handler
const errorResponse = (res, message = 'Something went wrong', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  // Include error details in development
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

// Async handler wrapper for controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }))
  });
};

// Not found response
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

// Forbidden response
const forbiddenResponse = (res, message = 'Insufficient permissions') => {
  return errorResponse(res, message, 403);
};

// Conflict response (for duplicate resources)
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

module.exports = {
  successResponse,
  errorResponse,
  asyncHandler,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse
}; 