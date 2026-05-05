// controller for /api/cards
// powers homepage "top regrade opportunities" grid

const Card = require('../models/card');

// returns priced cards normalized to camelCase
// homepage script expects this shape, db returns snake_case so we map here
exports.getSuggestedCards = async (req, res) => {
  try {
    const rows = await Card.getSuggested();

    // map db snake_case to api camelCase
    // Number() coerces NUMERIC strings from pg into JS numbers for toLocaleString()
    const data = rows.map(row => ({
      certNumber: row.cert_number,
      name: row.card_name,
      set: row.card_set,
      number: row.card_number,
      currentGrade: row.current_grade,
      psa9Price: Number(row.psa9_price),
      psa10Price: Number(row.psa10_price),
      imageUrl: row.image_url
    }));

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
