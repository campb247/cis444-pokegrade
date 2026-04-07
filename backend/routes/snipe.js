const express = require('express');
const router = express.Router();
const snipeController = require('../controllers/snipeController');

// GET /api/snipe?card=charizard - search eBay for PSA 9 cards
router.get('/', snipeController.searchCards);

module.exports = router;
