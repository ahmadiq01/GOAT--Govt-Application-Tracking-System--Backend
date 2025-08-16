const Application = require('../models/Application');
const ApplicationType = require('../models/ApplicationType');
const Officer = require('../models/Officer');
const authService = require('../services/authService');
const { successResponse, errorResponse, asyncHandler } = require('../utils/responseHandler');



// POST /api/applications
const submitApplication = asyncHandler(async (req, res) => {
  const {
    trackingNumber,  // Accept tracking number from frontend
    name,
    cnic,
    phone,
    email,
    address,
    applicationType, // can be name or _id
    officer,         // can be name or _id
    description,
    attachments = [],
  } = req.body;

  if (!trackingNumber || !name || !cnic || !phone || !applicationType) {
    return errorResponse(res, 'Missing required fields: trackingNumber, name, cnic, phone, applicationType', 400);
  }

  // Check if tracking number already exists
  const existingApplication = await Application.findOne({ trackingNumber });
  if (existingApplication) {
    return errorResponse(res, 'Tracking number already exists', 400);
  }

  // Ensure user exists with credentials (username = cnic, password = phone)
  try {
    // Try to find existing by nic
    let user = await authService.findUserByCredentials(cnic);
    if (!user) {
      user = await authService.createUser({ 
        name, 
        address, 
        nic: cnic, 
        phoneNo: phone, 
        email 
      });
    } else {
      // Update existing user with name and address if they are missing
      const updateData = {};
      if (!user.name && name) updateData.name = name;
      if (!user.address && address) updateData.address = address;
      if (!user.email && email) updateData.email = email;
      
      if (Object.keys(updateData).length > 0) {
        user = await authService.updateUserById(user._id, updateData);
      }
    }
  } catch (e) {
    // Duplicate key race or validation errors
    // Ignore if user already exists; otherwise surface error
    if (!/duplicate key/i.test(e.message)) {
      return errorResponse(res, 'Failed to ensure user credentials', 500, e);
    }
  }

  // Resolve applicationType (allow name or id), and officer (allow name or id)
  let applicationTypeDoc;
  if (applicationType) {
    if (typeof applicationType === 'string' && applicationType.match(/^[0-9a-fA-F]{24}$/)) {
      applicationTypeDoc = await ApplicationType.findById(applicationType);
    } else {
      applicationTypeDoc = await ApplicationType.findOne({ name: applicationType });
    }
  }
  if (!applicationTypeDoc) {
    return errorResponse(res, 'Invalid application type', 400);
  }

  let officerDoc = null;
  if (officer) {
    if (typeof officer === 'string' && officer.match(/^[0-9a-fA-F]{24}$/)) {
      officerDoc = await Officer.findById(officer);
    } else {
      officerDoc = await Officer.findOne({ name: officer });
    }
  }

  // Validate that attachments are valid S3 URLs
  let savedAttachmentUrls = [];
  if (attachments && attachments.length > 0) {
    // Validate that all attachments are valid S3 URLs
    const s3UrlPattern = /^https:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com\/.+/;
    
    for (const attachment of attachments) {
      if (!s3UrlPattern.test(attachment)) {
        return errorResponse(res, `Invalid S3 URL format: ${attachment}`, 400);
      }
    }
    
    savedAttachmentUrls = attachments;
  }

  const application = new Application({
    trackingNumber,
    name,
    cnic,
    phone,
    email,
    address,
    applicationTypeId: applicationTypeDoc._id,
    applicationTypeName: applicationTypeDoc.name,
    officerId: officerDoc ? officerDoc._id : undefined,
    officerName: officerDoc ? officerDoc.name : undefined,
    officerDesignation: officerDoc ? officerDoc.designation : undefined,
    description,
    attachments: savedAttachmentUrls,
    status: 'Submitted',
    acknowledgement: 'Received',
    submittedAt: new Date(),
  });

  await application.save();

  return successResponse(
    res,
    {
      trackingNumber: application.trackingNumber,
      name: application.name,
      cnic: application.cnic,
      phone: application.phone,
      email: application.email,
      address: application.address,
      applicationType: application.applicationTypeName,
      description: application.description,
      attachments: application.attachments,
      acknowledgement: application.acknowledgement,
      status: application.status,
      submittedAt: application.submittedAt,
    },
    'Application submitted successfully.',
    201
  );
});

// GET /api/applications/:trackingNumber
const getApplicationByTrackingNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  const application = await Application.findOne({ trackingNumber });
  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  return successResponse(res, {
    trackingNumber: application.trackingNumber,
    name: application.name,
    cnic: application.cnic,
    phone: application.phone,
    email: application.email,
    address: application.address,
    applicationType: application.applicationTypeName,
    description: application.description,
    attachments: application.attachments,
    acknowledgement: application.acknowledgement,
    status: application.status,
    submittedAt: application.submittedAt,
  });
});

// GET /api/applications/user/:cnic
const getUserApplications = asyncHandler(async (req, res) => {
  const { cnic } = req.params;
  const { role } = req.user; // Get user role from auth middleware

  // Find user by CNIC
  const user = await authService.findUserByCredentials(cnic);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Check if user has permission to view this data
  if (role === 'user' && req.user.nic !== cnic) {
    return errorResponse(res, 'Access denied. You can only view your own applications.', 403);
  }

  // Find all applications for this user
  const applications = await Application.find({ cnic })
    .populate('applicationTypeId', 'name description')
    .populate('officerId', 'name designation department')
    .sort({ createdAt: -1 });

  // Get application types and officers for reference
  const applicationTypes = await ApplicationType.find({});
  const officers = await Officer.find({});

  return successResponse(res, {
    user: {
      _id: user._id,
      name: user.name,
      address: user.address,
      email: user.email,
      nic: user.nic,
      phoneNo: user.phoneNo,
      role: user.role,
      createdAt: user.createdAt
    },
    applications: applications.map(app => ({
      _id: app._id,
      trackingNumber: app.trackingNumber,
      name: app.name,
      cnic: app.cnic,
      phone: app.phone,
      email: app.email,
      address: app.address,
      applicationType: {
        _id: app.applicationTypeId._id,
        name: app.applicationTypeName,
        description: app.applicationTypeId.description
      },
      officer: app.officerId ? {
        _id: app.officerId._id,
        name: app.officerName,
        designation: app.officerDesignation,
        department: app.officerId.department
      } : null,
      description: app.description,
      attachments: app.attachments,
      status: app.status,
      acknowledgement: app.acknowledgement,
      submittedAt: app.submittedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    })),
    applicationTypes: applicationTypes.map(type => ({
      _id: type._id,
      name: type.name,
      description: type.description
    })),
    officers: officers.map(officer => ({
      _id: officer._id,
      name: officer.name,
      designation: officer.designation,
      department: officer.department
    }))
  });
});

// GET /api/applications/user/:cnic/summary
const getUserApplicationsSummary = asyncHandler(async (req, res) => {
  const { cnic } = req.params;
  const { role } = req.user; // Get user role from auth middleware

  // Find user by CNIC
  const user = await authService.findUserByCredentials(cnic);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Check if user has permission to view this data
  if (role === 'user' && req.user.nic !== cnic) {
    return errorResponse(res, 'Access denied. You can only view your own applications.', 403);
  }

  // Get application counts by status
  const statusCounts = await Application.aggregate([
    { $match: { cnic } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get recent applications (last 5)
  const recentApplications = await Application.find({ cnic })
    .select('trackingNumber name applicationTypeName status submittedAt')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get application type distribution
  const applicationTypeDistribution = await Application.aggregate([
    { $match: { cnic } },
    { $group: { _id: '$applicationTypeName', count: { $sum: 1 } } }
  ]);

  return successResponse(res, {
    user: {
      _id: user._id,
      name: user.name,
      address: user.address,
      email: user.email,
      nic: user.nic,
      phoneNo: user.phoneNo,
      role: user.role
    },
    summary: {
      totalApplications: statusCounts.reduce((sum, item) => sum + item.count, 0),
      statusBreakdown: statusCounts,
      applicationTypeDistribution,
      recentApplications
    }
  });
});

// GET /api/applications/user/details/:cnic
const getUserDetails = asyncHandler(async (req, res) => {
  const { cnic } = req.params;

  // Find user by CNIC
  const user = await authService.findUserByCredentials(cnic);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Get user's application count
  const applicationCount = await Application.countDocuments({ cnic });

  // Format response as requested
  return successResponse(res, {
    "Full Name": user.name || "N/A",
    "Existing User": "Yes",
    "CNIC Number": user.nic || "N/A",
    "Mobile Number": user.phoneNo || "N/A",
    "Email Address": user.email || "N/A",
    "Complete Address": user.address || "N/A",
    "Total Applications": applicationCount,
    "User ID": user._id,
    "Role": user.role,
    "Created At": user.createdAt,
    "Last Updated": user.updatedAt
  });
});

// GET /api/applications - Get all applications (admin/superadmin only)
const getAllApplications = asyncHandler(async (req, res) => {
  const { role } = req.user;
  
  // Check if user has permission to view all applications
  if (role === 'user') {
    return errorResponse(res, 'Access denied. Only admin users can view all applications.', 403);
  }

  const {
    page = 1,
    limit = 10,
    status,
    applicationType,
    officer,
    cnic,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter query
  const filter = {};
  if (status) filter.status = status;
  if (applicationType) filter.applicationTypeName = { $regex: applicationType, $options: 'i' };
  if (officer) filter.officerName = { $regex: officer, $options: 'i' };
  if (cnic) filter.cnic = { $regex: cnic, $options: 'i' };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Build sort query
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const applications = await Application.find(filter)
    .populate('applicationTypeId', 'name description')
    .populate('officerId', 'name designation department')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Application.countDocuments(filter);

  // Get summary statistics
  const statusStats = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const applicationTypeStats = await Application.aggregate([
    { $group: { _id: '$applicationTypeName', count: { $sum: 1 } } }
  ]);

  return successResponse(res, {
    applications: applications.map(app => ({
      _id: app._id,
      trackingNumber: app.trackingNumber,
      name: app.name,
      cnic: app.cnic,
      phone: app.phone,
      email: app.email,
      address: app.address,
      applicationType: {
        _id: app.applicationTypeId._id,
        name: app.applicationTypeName,
        description: app.applicationTypeId.description
      },
      officer: app.officerId ? {
        _id: app.officerId._id,
        name: app.officerName,
        designation: app.officerDesignation,
        department: app.officerId.department
      } : null,
      description: app.description,
      attachments: app.attachments,
      status: app.status,
      acknowledgement: app.acknowledgement,
      submittedAt: app.submittedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    statistics: {
      statusBreakdown: statusStats,
      applicationTypeBreakdown: applicationTypeStats
    }
  });
});

module.exports = {
  submitApplication,
  getApplicationByTrackingNumber,
  getUserApplications,
  getUserApplicationsSummary,
  getUserDetails,
  getAllApplications,
};


