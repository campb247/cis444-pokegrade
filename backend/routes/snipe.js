// routes for /api/snipe
// mounted under /api/snipe in server.js

const express = require('express');
const router = express.Router();
const snipeController = require('../controllers/snipeController');

// returns curated psa 9 listings, optionally filtered by ?card=
// would call ebay browse api in production
router.get('/', snipeController.searchCards);

module.exports = router;
