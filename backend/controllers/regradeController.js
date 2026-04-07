/**
 * Regrade Controller
 * Handles card image analysis for PSA grade estimation
 */

// Analyze uploaded card image
exports.analyzeCard = async (req, res) => {
  try {
    // TODO: Accept image from request body (base64 or multipart)
    // TODO: Run centering analysis on image
    // TODO: Return grade breakdown

    res.json({
      success: true,
      message: 'Regrade analysis endpoint — implementation in progress',
      data: {
        estimatedGrade: null,
        centering: null,
        corners: null,
        edges: null,
        surface: null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Look up card via PSA certification number
exports.lookupByCert = async (req, res) => {
  try {
    const { certNumber } = req.params;
    // TODO: Call PSA API with certNumber to retrieve card details + image URL

    res.json({
      success: true,
      message: `PSA lookup for cert #${certNumber} — implementation in progress`,
      data: { certNumber, imageUrl: null, cardName: null, currentGrade: null }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
