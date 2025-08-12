const Application = require('../models/Application');
const ApplicationType = require('../models/ApplicationType');
const Officer = require('../models/Officer');
const authService = require('../services/authService');
const { successResponse, errorResponse, asyncHandler } = require('../utils/responseHandler');

const generateTrackingNumber = () => {
  const ts = Math.floor(Date.now() / 1000);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GOAT-${ts}-${rand}`;
};

// POST /api/applications
const submitApplication = asyncHandler(async (req, res) => {
  const {
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

  if (!name || !cnic || !phone || !applicationType) {
    return errorResponse(res, 'Missing required fields: name, cnic, phone, applicationType', 400);
  }

  // Ensure user exists with credentials (username = cnic, password = phone)
  try {
    // Try to find existing by nic
    let user = await authService.findUserByCredentials(cnic);
    if (!user) {
      user = await authService.createUser({ nic: cnic, phoneNo: phone, email });
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

  const trackingNumber = generateTrackingNumber();

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

module.exports = {
  submitApplication,
  getApplicationByTrackingNumber,
};


