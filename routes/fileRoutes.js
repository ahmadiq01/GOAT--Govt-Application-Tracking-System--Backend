// routes/fileRoutes.js - With URL refresh endpoint
const express = require('express');
const { uploadFiles, getFilesByApplication } = require('../controllers/fileController');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// POST /api/files/upload - Upload single or multiple files to S3
// Supports both single file and multiple files
router.post('/upload', 
  upload.array('files', 10), // Allow up to 10 files
  uploadFiles
);

// GET /api/files/:applicationTrackingNumber - Get files for an application
router.get('/:applicationTrackingNumber', getFilesByApplication);

module.exports = router;