// controllers/fileController.js - With URL refresh functionality
const { uploadFile } = require('../services/s3Service');
const { successResponse, errorResponse, asyncHandler } = require('../utils/responseHandler');

// POST /api/files/upload - Upload single or multiple files to S3
const uploadFiles = asyncHandler(async (req, res) => {
  const { applicationTrackingNumber } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return errorResponse(res, 'No files provided', 400);
  }

  if (!applicationTrackingNumber) {
    return errorResponse(res, 'Application tracking number is required', 400);
  }

  try {
    const uploadPromises = files.map(async (file) => {
      try {
        // Upload file to S3 with organized folder structure
        const s3Url = await uploadFile(file, `applications/${applicationTrackingNumber}`);
        
        return {
          originalName: file.originalname,
          s3Url: s3Url,
          size: file.size,
          mimetype: file.mimetype
        };
      } catch (uploadError) {
        console.error(`Failed to upload file ${file.originalname}:`, uploadError);
        throw new Error(`Failed to upload ${file.originalname}: ${uploadError.message}`);
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    
    // Extract just the S3 URLs for the response
    const s3Urls = uploadedFiles.map(file => file.s3Url);

    return successResponse(
      res,
      {
        message: `Successfully uploaded ${files.length} file(s)`,
        files: uploadedFiles,
        s3Urls: s3Urls, // Just the URLs as requested
        applicationTrackingNumber: applicationTrackingNumber
      },
      'Files uploaded successfully',
      201
    );

  } catch (error) {
    console.error('File upload error:', error);
    return errorResponse(res, 'Failed to upload files', 500, error);
  }
});

// GET /api/files/:applicationTrackingNumber - Get files for an application
const getFilesByApplication = asyncHandler(async (req, res) => {
  const { applicationTrackingNumber } = req.params;
  
  if (!applicationTrackingNumber) {
    return errorResponse(res, 'Application tracking number is required', 400);
  }

  // This would typically query a database to get file records
  // For now, returning a placeholder response
  return successResponse(
    res,
    {
      applicationTrackingNumber,
      message: 'File retrieval functionality can be implemented with database integration'
    },
    'File retrieval endpoint ready'
  );
});

module.exports = {
  uploadFiles,
  getFilesByApplication
};