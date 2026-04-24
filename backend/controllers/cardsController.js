const Card = require('../models/card');

exports.getSuggestedCards = async (req, res) => {
  try {
    const cards = await Card.getSuggested();

    res.json({
      success: true,
      data: cards
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};