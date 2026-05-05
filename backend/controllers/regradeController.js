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
      message: 'Regrade analysis endpoint: implementation in progress',
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
    const cert = psaData?.PSACert;

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    let imageUrl = null;
    try {
      const images = await psaService.getImagesByCertNumber(certNumber);
      if (Array.isArray(images) && images.length) {
        const front = images.find(img => img.IsFrontImage) || images[0];
        imageUrl = front.ImageURL || null;
      }
    } catch (_) {
      // Image lookup is best-effort: fall through with imageUrl=null
    }

    const normalizedCard = {
      certNumber,
      cardName: cert.Subject || 'Unknown Card',
      setName: cert.Brand || null,
      cardNumber: cert.CardNumber || null,
      currentGrade: cert.GradeDescription || cert.CardGrade || null,
      psa9Price: null,
      psa10Price: null,
      imageUrl
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