// controllers/fileController.js
const s3Service = require('../services/s3Service');
const File = require('../models/File');
const { validationResult } = require('express-validator');

class FileController {
  // Upload single or multiple files
  async uploadFiles(req, res) {
    try {
      // Check if files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided. Please select at least one file to upload.',
          data: null
        });
      }

      let uploadResults;
      let savedFiles = [];

      // Handle single or multiple file upload
      if (req.files.length === 1) {
        // Single file upload
        const uploadResult = await s3Service.uploadFile(req.files[0]);
        uploadResults = [uploadResult];
      } else {
        // Multiple files upload
        uploadResults = await s3Service.uploadMultipleFiles(req.files);
      }

      // Save file information to database
      for (const result of uploadResults) {
        const fileDoc = new File({
          originalName: result.originalName,
          fileName: result.key.split('/').pop(),
          fileUrl: result.url,
          s3Key: result.key,
          mimeType: result.mimeType,
          size: result.size
        });

        const savedFile = await fileDoc.save();
        savedFiles.push({
          id: savedFile._id,
          url: savedFile.fileUrl,
          originalName: savedFile.originalName,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
          uploadDate: savedFile.uploadDate
        });
      }

      // Return response
      const response = {
        success: true,
        message: `Successfully uploaded ${savedFiles.length} file(s)`,
        data: {
          files: savedFiles,
          totalFiles: savedFiles.length,
          uploadedAt: new Date().toISOString()
        }
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message,
        data: null
      });
    }
  }

  // Get all uploaded files
  async getFiles(req, res) {
    try {
      const { page = 1, limit = 20, mimeType } = req.query;
      
      const filter = { isActive: true };
      if (mimeType) {
        filter.mimeType = { $regex: mimeType, $options: 'i' };
      }

      const files = await File.find(filter)
        .sort({ uploadDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      const totalFiles = await File.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: 'Files retrieved successfully',
        data: {
          files: files,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalFiles / limit),
            totalFiles: totalFiles,
            hasNextPage: page < Math.ceil(totalFiles / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
        error: error.message,
        data: null
      });
    }
  }

  // Get single file by ID
  async getFileById(req, res) {
    try {
      const { id } = req.params;
      
      const file = await File.findOne({ _id: id, isActive: true }).select('-__v');
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'File retrieved successfully',
        data: { file }
      });

    } catch (error) {
      console.error('Get file by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
        error: error.message,
        data: null
      });
    }
  }

  // Delete file
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      
      const file = await File.findOne({ _id: id, isActive: true });
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          data: null
        });
      }

      // Delete from S3
      await s3Service.deleteFile(file.s3Key);
      
      // Mark as inactive in database (soft delete)
      file.isActive = false;
      await file.save();

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: null
      });

    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message,
        data: null
      });
    }
  }
}

module.exports = new FileController();