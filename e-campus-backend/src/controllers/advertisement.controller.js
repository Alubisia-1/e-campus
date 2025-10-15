const Advertisement = require('../models/Advertisement.model');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all active advertisements
 * @route   GET /api/ads
 * @access  Public
 */
exports.getActiveAds = asyncHandler(async (req, res) => {
  const { type, position, limit = 5 } = req.query;

  // Get active ads using the static method
  let ads = await Advertisement.getActiveAds(type, position);

  // Rotate ads - shuffle to show different ones each time
  ads = shuffleArray(ads);

  // Limit the number of ads returned
  ads = ads.slice(0, parseInt(limit));

  res.status(200).json({
    status: 'success',
    count: ads.length,
    data: ads
  });
});

/**
 * @desc    Get advertisement by ID
 * @route   GET /api/ads/:id
 * @access  Public
 */
exports.getAdById = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: ad
  });
});

/**
 * @desc    Track advertisement impression
 * @route   POST /api/ads/:id/impression
 * @access  Public
 */
exports.trackImpression = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  // Check if ad is still active and within date range
  const now = new Date();
  if (!ad.isActive || ad.startDate > now || ad.endDate < now) {
    return res.status(400).json({
      status: 'error',
      message: 'Advertisement is not currently active'
    });
  }

  await ad.incrementImpressions();

  res.status(200).json({
    status: 'success',
    message: 'Impression tracked successfully'
  });
});

/**
 * @desc    Track advertisement click and redirect
 * @route   GET /api/ads/:id/click
 * @access  Public
 */
exports.trackClick = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  // Check if ad is still active and within date range
  const now = new Date();
  if (!ad.isActive || ad.startDate > now || ad.endDate < now) {
    return res.status(400).json({
      status: 'error',
      message: 'Advertisement is not currently active'
    });
  }

  await ad.incrementClicks();

  // Redirect to the advertisement link
  res.redirect(ad.link);
});

/**
 * @desc    Get advertisement statistics
 * @route   GET /api/ads/:id/stats
 * @access  Public
 */
exports.getAdStats = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      id: ad._id,
      company: ad.company,
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: ad.ctr,
      isActive: ad.isActive,
      startDate: ad.startDate,
      endDate: ad.endDate
    }
  });
});

/**
 * Helper function to shuffle array (Fisher-Yates algorithm)
 * Used to rotate/randomize ad display
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
