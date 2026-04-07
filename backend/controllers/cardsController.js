/**
 * Cards Controller
 * Returns suggested cards with large PSA 9->10 price differences
 */

exports.getSuggestedCards = async (req, res) => {
  try {
    // TODO: Query DB for cards with cached price data
    // TODO: Sort by (psa10Price - psa9Price) descending

    // Sample data for Scrum 1 demo
    const sampleCards = [
      { name: 'Charizard', set: 'Base Set', number: '4/102', psa9Price: 800, psa10Price: 8000 },
      { name: 'Blastoise', set: 'Base Set', number: '2/102', psa9Price: 300, psa10Price: 2200 },
      { name: 'Lugia', set: 'Neo Genesis', number: '9/111', psa9Price: 400, psa10Price: 2500 }
    ];

    res.json({ success: true, data: sampleCards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
