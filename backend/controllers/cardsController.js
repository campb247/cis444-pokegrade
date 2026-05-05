const Card = require('../models/card');

exports.getSuggestedCards = async (req, res) => {
  try {
    const rows = await Card.getSuggested();

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