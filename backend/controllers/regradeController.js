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
const Card = require('../models/card');
const psaService = require('../services/psaService');

exports.lookupByCert = async (req, res) => {
  try {
    const { certNumber } = req.params;

    const cachedCard = await Card.findByCert(certNumber);
    if (cachedCard) {
      return res.json({
        success: true,
        source: 'database',
        data: cachedCard
      });
    }

    const psaData = await psaService.getCertByNumber(certNumber);

    if (!psaData || psaData.IsValidRequest === false) {
      return res.status(404).json({
        success: false,
        error: psaData?.ServerMessage || 'Card not found'
      });
    }

    const normalizedCard = {
      certNumber,
      cardName: psaData.SpecDescription || psaData.Subject || 'Unknown Card',
      setName: psaData.Brand || null,
      cardNumber: psaData.CardNumber || null,
      currentGrade: psaData.GradeDescription || psaData.Grade || null,
      psa9Price: null,
      psa10Price: null,
      imageUrl: psaData.ImageURL || psaData.HolderImageURL || null
    };

    await Card.createOrUpdate(normalizedCard);

    return res.json({
      success: true,
      source: 'psa',
      data: normalizedCard
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};