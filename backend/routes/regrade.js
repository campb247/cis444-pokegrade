const express = require('express');
const router = express.Router();
const regradeController = require('../controllers/regradeController');

// POST /api/regrade - analyze a card image
router.post('/', regradeController.analyzeCard);

// GET /api/regrade/psa/:certNumber - look up card by PSA cert number
router.get('/psa/:certNumber', regradeController.lookupByCert);

module.exports = router;
