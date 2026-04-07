/**
 * Snipe Controller
 * Searches eBay for PSA 9 cards with regrade potential
 */

exports.searchCards = async (req, res) => {
  try {
    const { card } = req.query;
    // TODO: Call eBay Browse API searching for "PSA 9 {card}" listings
    // TODO: Sort by newest listed first (newer = less likely to have been seen/passed on)
    // TODO: Return listings with images, prices, cert numbers

    res.json({
      success: true,
      message: `eBay snipe search for "${card}" — implementation in progress`,
      data: []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
