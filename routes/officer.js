const express = require('express');
const router = express.Router();
const { getOfficers } = require('../controllers/officerController');

// GET /api/officers - Get all officers
router.get('/', getOfficers);

module.exports = router; 