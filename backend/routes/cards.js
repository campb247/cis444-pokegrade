// routes for /api/cards
// mounted under /api/cards in server.js

const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');

// returns cards sorted by psa9 -> psa10 price diff, descending
// powers homepage "top regrade opportunities" section
router.get('/suggested', cardsController.getSuggestedCards);

module.exports = router;
