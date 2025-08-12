// controllers/fileController.js - With URL refresh functionality
const { uploadFile } = require('../services/s3Service');
const { successResponse, errorResponse, asyncHandler } = require('../utils/responseHandler');

// POST /api/files/upload - Upload single or multiple files to S3
const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return errorResponse(res, 'No files provided', 400);
  }

  try {
    const uploadPromises = files.map(async (file) => {
      try {
        // Upload file to S3 directly to uploads folder
        const s3Url = await uploadFile(file, 'uploads');
        
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
        s3Urls: s3Urls // Just the URLs as requested
      },
      'Files uploaded successfully',
      201
    );

  } catch (error) {
    console.error('File upload error:', error);
    return errorResponse(res, 'Failed to upload files', 500, error);
  }
});

// GET /api/files - Get all uploaded files
const getAllFiles = asyncHandler(async (req, res) => {
  // This would typically query a database to get file records
  // For now, returning a placeholder response
  return successResponse(
    res,
    {
      message: 'File retrieval functionality can be implemented with database integration'
    },
    'File retrieval endpoint ready'
  );
});

module.exports = {
  uploadFiles,
  getAllFiles
};