const Advertisement = require('../models/Advertisement.model');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all active advertisements
 * @route   GET /api/ads
 * @access  Public
 */
exports.getActiveAds = asyncHandler(async (req, res) => {
  const { type, position, limit = 5 } = req.query;
  const filterType = type || position;

  // Get active ads using the static method
  let ads = await Advertisement.getActiveAds(filterType);

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

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

/**
 * @desc    Get all advertisements (including inactive) - Admin only
 * @route   GET /api/ads/admin/all
 * @access  Private/Admin
 */
exports.getAllAdsAdmin = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (type) query.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Advertisement.countDocuments(query);

  const ads = await Advertisement.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    count: ads.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: ads
  });
});

/**
 * @desc    Create new advertisement - Admin only
 * @route   POST /api/ads
 * @access  Private/Admin
 */
exports.createAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Advertisement created successfully',
    data: ad
  });
});

/**
 * @desc    Update advertisement - Admin only
 * @route   PUT /api/ads/:id
 * @access  Private/Admin
 */
exports.updateAd = asyncHandler(async (req, res) => {
  let ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Advertisement updated successfully',
    data: ad
  });
});

/**
 * @desc    Delete advertisement - Admin only
 * @route   DELETE /api/ads/:id
 * @access  Private/Admin
 */
exports.deleteAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  await ad.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Advertisement deleted successfully'
  });
});

/**
 * @desc    Toggle advertisement active status - Admin only
 * @route   PUT /api/ads/:id/toggle
 * @access  Private/Admin
 */
exports.toggleAdStatus = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  ad.isActive = !ad.isActive;
  await ad.save();

  res.status(200).json({
    status: 'success',
    message: `Advertisement ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
    data: ad
  });
});

/**
 * @desc    Mark advertisement as paid - Admin only
 * @route   PUT /api/ads/:id/mark-paid
 * @access  Private/Admin
 */
exports.markAdPaid = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return res.status(404).json({
      status: 'error',
      message: 'Advertisement not found'
    });
  }

  const { paymentMethod, paymentReference } = req.body;
  await ad.markAsPaid(paymentMethod, paymentReference);

  res.status(200).json({
    status: 'success',
    message: 'Advertisement marked as paid',
    data: ad
  });
});

/**
 * @desc    Get revenue statistics - Admin only
 * @route   GET /api/ads/admin/revenue
 * @access  Private/Admin
 */
exports.getRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const revenue = await Advertisement.getTotalRevenue(startDate, endDate);

  // Get additional stats
  const totalAds = await Advertisement.countDocuments();
  const activeAds = await Advertisement.countDocuments({ isActive: true });
  const paidAds = await Advertisement.countDocuments({ paymentStatus: 'paid' });
  const pendingPayment = await Advertisement.countDocuments({ paymentStatus: 'pending' });

  res.status(200).json({
    status: 'success',
    data: {
      revenue,
      stats: {
        totalAds,
        activeAds,
        paidAds,
        pendingPayment
      }
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
