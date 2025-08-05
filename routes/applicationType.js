const express = require('express');
const router = express.Router();
const { getApplicationTypes } = require('../controllers/applicationTypeController');

// GET /api/application-types - Get all application types
router.get('/', getApplicationTypes);

module.exports = router; 