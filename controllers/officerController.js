const Officer = require('../models/Officer');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get all officers
const getOfficers = async (req, res) => {
  try {

       const officers = await Officer.find({ isActive: true })
      .select('name office designation')
      .sort({ office: 1, name: 1 });

    return successResponse(res, officers, 'Officers retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching officers:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = {
  getOfficers
}; 