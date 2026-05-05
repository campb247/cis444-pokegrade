// routes for /api/regrade
// mounted under /api/regrade in server.js

const express = require('express');
const router = express.Router();
const regradeController = require('../controllers/regradeController');

// stub endpoint for future image-based regrade analysis
// frontend uses canvas-side measurement for now
router.post('/', regradeController.analyzeCard);

// looks up card by psa cert number
// hits db cache first, falls back to psa public api
router.get('/psa/:certNumber', regradeController.lookupByCert);

module.exports = router;
