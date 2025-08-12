// routes/fileRoutes.js - With URL refresh endpoint
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/fileUpload');
const { validateFiles } = require('../middleware/validation');

// Test S3 connection endpoint
router.get('/test-connection', fileController.testConnection);

// Upload files endpoint
router.post('/upload', 
  upload.array('files', 10),
  (req, res, next) => {
    console.log('Files received by multer:', req.files ? req.files.length : 0);
    next();
  },
  validateFiles,
  fileController.uploadFiles
);

// Get all files (with optional URL refresh)
// Usage: GET /api/files?refreshUrls=true
router.get('/', fileController.getFiles);

// Get file by ID (with optional URL refresh)
// Usage: GET /api/files/:id?refreshUrl=true
router.get('/:id', fileController.getFileById);

// Refresh URL for a specific file
// Usage: POST /api/files/:id/refresh-url?expiresIn=86400
router.post('/:id/refresh-url', fileController.refreshFileUrl);

// Delete file
router.delete('/:id', fileController.deleteFile);

module.exports = router;