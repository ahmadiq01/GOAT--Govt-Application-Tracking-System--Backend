const ApplicationType = require('../models/ApplicationType');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get all application types
const getApplicationTypes = async (req, res) => {
  try {
    const applicationTypes = await ApplicationType.find({ isActive: true })
      .select('name description')
      .sort({ name: 1 });

    return successResponse(res, applicationTypes, 'Application types retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching application types:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = {
  getApplicationTypes
}; 