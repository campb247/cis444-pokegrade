const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');

// GET /api/cards/suggested - get cards with highest PSA 9->10 price difference
router.get('/suggested', cardsController.getSuggestedCards);

module.exports = router;
