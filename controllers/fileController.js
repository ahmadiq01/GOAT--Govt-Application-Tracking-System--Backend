// controllers/fileController.js - With URL refresh functionality
const s3Service = require('../services/s3Service');
const File = require('../models/File');
const { validationResult } = require('express-validator');

class FileController {
  // Upload single or multiple files
  async uploadFiles(req, res) {
    try {
      console.log('Upload request received:', {
        filesCount: req.files ? req.files.length : 0,
        body: req.body
      });

      if (!req.files || req.files.length === 0) {
        console.log('No files provided in request');
        return res.status(400).json({
          success: false,
          message: 'No files provided. Please select at least one file to upload.',
          data: null
        });
      }

      console.log('Files to upload:', req.files.map(f => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      })));

      let uploadResults;
      let savedFiles = [];

      try {
        if (req.files.length === 1) {
          console.log('Processing single file upload');
          const uploadResult = await s3Service.uploadFile(req.files[0]);
          uploadResults = [uploadResult];
        } else {
          console.log(`Processing multiple files upload: ${req.files.length} files`);
          uploadResults = await s3Service.uploadMultipleFiles(req.files);
        }

        console.log('S3 upload completed successfully:', uploadResults.length, 'files');
      } catch (s3Error) {
        console.error('S3 upload failed:', s3Error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload files to S3',
          error: s3Error.message,
          data: null
        });
      }

      // Save file information to database
      try {
        for (const result of uploadResults) {
          console.log('Saving file to database:', result.originalName);
          
          const fileDoc = new File({
            originalName: result.originalName,
            fileName: result.key.split('/').pop(),
            fileUrl: result.url, // This will be a presigned URL
            s3Key: result.key,
            mimeType: result.mimeType,
            size: result.size
          });

          const savedFile = await fileDoc.save();
          console.log('File saved to database with ID:', savedFile._id);
          
          savedFiles.push({
            id: savedFile._id,
            url: savedFile.fileUrl,
            originalName: savedFile.originalName,
            mimeType: savedFile.mimeType,
            size: savedFile.size,
            uploadDate: savedFile.uploadDate
          });
        }
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        console.log('Warning: Files uploaded to S3 but database save failed');
      }

      const response = {
        success: true,
        message: `Successfully uploaded ${savedFiles.length} file(s)`,
        data: {
          files: savedFiles,
          totalFiles: savedFiles.length,
          uploadedAt: new Date().toISOString(),
          note: "URLs are presigned and valid for 24 hours. Use the refresh-url endpoint to get new URLs when they expire."
        }
      };

      console.log('Upload completed successfully:', response);
      res.status(201).json(response);

    } catch (error) {
      console.error('File upload error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
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
      const { page = 1, limit = 20, mimeType, refreshUrls = false } = req.query;
      
      const filter = { isActive: true };
      if (mimeType) {
        filter.mimeType = { $regex: mimeType, $options: 'i' };
      }

      const files = await File.find(filter)
        .sort({ uploadDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      // Optionally refresh URLs if requested
      if (refreshUrls === 'true') {
        for (let file of files) {
          try {
            const newUrl = await s3Service.getFileUrl(file.s3Key, 86400); // 24 hours
            file.fileUrl = newUrl;
          } catch (error) {
            console.error('Failed to refresh URL for file:', file._id, error.message);
          }
        }
      }

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
      const { refreshUrl = false } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'File ID is required',
          data: null
        });
      }
      
      const file = await File.findOne({ _id: id, isActive: true }).select('-__v');
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          data: null
        });
      }

      // Optionally refresh URL if requested
      if (refreshUrl === 'true') {
        try {
          const newUrl = await s3Service.getFileUrl(file.s3Key, 86400); // 24 hours
          file.fileUrl = newUrl;
        } catch (error) {
          console.error('Failed to refresh URL for file:', file._id, error.message);
        }
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

  // Refresh URL for a specific file
  async refreshFileUrl(req, res) {
    try {
      const { id } = req.params;
      const { expiresIn = 86400 } = req.query; // Default 24 hours
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'File ID is required',
          data: null
        });
      }
      
      const file = await File.findOne({ _id: id, isActive: true });
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          data: null
        });
      }

      try {
        const newUrl = await s3Service.getFileUrl(file.s3Key, parseInt(expiresIn));
        
        // Optionally update the database with new URL
        file.fileUrl = newUrl;
        await file.save();

        res.status(200).json({
          success: true,
          message: 'File URL refreshed successfully',
          data: {
            id: file._id,
            url: newUrl,
            expiresIn: parseInt(expiresIn),
            refreshedAt: new Date().toISOString()
          }
        });
      } catch (s3Error) {
        console.error('Failed to refresh URL:', s3Error);
        res.status(500).json({
          success: false,
          message: 'Failed to refresh file URL',
          error: s3Error.message,
          data: null
        });
      }

    } catch (error) {
      console.error('Refresh URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh file URL',
        error: error.message,
        data: null
      });
    }
  }

  // Delete file
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'File ID is required',
          data: null
        });
      }
      
      const file = await File.findOne({ _id: id, isActive: true });
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
          data: null
        });
      }

      try {
        await s3Service.deleteFile(file.s3Key);
        console.log('File deleted from S3:', file.s3Key);
      } catch (s3Error) {
        console.error('Failed to delete from S3:', s3Error);
      }
      
      file.isActive = false;
      await file.save();
      console.log('File marked as inactive in database:', file._id);

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

  // Test S3 connection endpoint
  async testConnection(req, res) {
    try {
      const isConnected = await s3Service.testS3Connection();
      
      res.status(200).json({
        success: isConnected,
        message: isConnected ? 'S3 connection successful' : 'S3 connection failed',
        data: {
          timestamp: new Date().toISOString(),
          bucket: process.env.S3_BUCKET_NAME,
          region: process.env.AWS_REGION
        }
      });
    } catch (error) {
      console.error('S3 connection test error:', error);
      res.status(500).json({
        success: false,
        message: 'S3 connection test failed',
        error: error.message,
        data: null
      });
    }
  }
}

module.exports = new FileController();