// routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/fileUpload');
const { validateFiles } = require('../middleware/validation');

// Upload files endpoint (handles both single and multiple files)
router.post('/upload', 
  upload.array('files', 10), // Accept up to 10 files with field name 'files'
  validateFiles,
  fileController.uploadFiles
);

// Get all files
router.get('/', fileController.getFiles);

// Get file by ID
router.get('/:id', fileController.getFileById);

// Delete file
router.delete('/:id', fileController.deleteFile);

module.exports = router;