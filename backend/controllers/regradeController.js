// controller for /api/regrade
// handles cert lookups and (future) image-based grade analysis

// stub for image-upload analysis flow
// frontend currently does centering math client-side via canvas
// kept here so route stays functional and signals intended future work
exports.analyzeCard = async (req, res) => {
  try {
    // accepts image from request body (base64 or multipart)
    // runs centering analysis on image
    // returns grade breakdown

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

// imports placed mid-file because analyzeCard above needs no deps
// keeps top of file focused on stub endpoint
const Card = require('../models/card');
const psaService = require('../services/psaService');

// looks up card by cert number
// flow: db cache -> psa cert api -> psa images api -> persist + return
exports.lookupByCert = async (req, res) => {
  try {
    const { certNumber } = req.params;

    // db cache hit returns immediately
    // avoids redundant psa api calls and keeps lookups fast
    const cachedCard = await Card.findByCert(certNumber);
    if (cachedCard) {
      return res.json({
        success: true,
        source: 'database',
        data: cachedCard
      });
    }

    // psa wraps cert metadata under PSACert key
    // missing wrapper means cert not found or invalid
    const psaData = await psaService.getCertByNumber(certNumber);
    const cert = psaData?.PSACert;

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // image fetch is best-effort
    // some certs have no scans, psa returns []
    let imageUrl = null;
    try {
      const images = await psaService.getImagesByCertNumber(certNumber);
      if (Array.isArray(images) && images.length) {
        // prefer front image, fall back to first available scan
        const front = images.find(img => img.IsFrontImage) || images[0];
        imageUrl = front.ImageURL || null;
      }
    } catch (_) {
      // swallow image errors, lookup still succeeds without scan
    }

    // normalize psa response to internal shape
    // pricing left null, populated separately by seed or future price scraper
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

    // cache for next lookup of same cert
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
