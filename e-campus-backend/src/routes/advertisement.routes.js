const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  getActiveAds,
  getAdById,
  trackImpression,
  trackClick,
  getAdStats,
  // Admin routes
  getAllAdsAdmin,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  markAdPaid,
  getRevenue
} = require('../controllers/advertisement.controller');

/**
 * @route   GET /api/ads
 * @desc    Get all active advertisements (with optional filtering)
 * @query   type - Filter by ad type (banner, sidebar, inline)
 * @query   position - Filter by position (top, middle, bottom, right, left)
 * @query   limit - Maximum number of ads to return (default: 5)
 * @access  Public
 */
router.get('/', apiLimiter, getActiveAds);

/**
 * @route   GET /api/ads/:id
 * @desc    Get single advertisement by ID
 * @access  Public
 */
router.get('/:id', apiLimiter, getAdById);

/**
 * @route   POST /api/ads/:id/impression
 * @desc    Track advertisement impression (view)
 * @access  Public
 */
router.post('/:id/impression', apiLimiter, trackImpression);

/**
 * @route   POST /api/ads/:id/click
 * @desc    Track advertisement click
 * @access  Public
 */
router.post('/:id/click', apiLimiter, trackClick);

/**
 * @route   GET /api/ads/:id/stats
 * @desc    Get advertisement statistics (impressions, clicks, CTR)
 * @access  Public
 */
router.get('/:id/stats', apiLimiter, getAdStats);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

/**
 * @route   GET /api/ads/admin/all
 * @desc    Get all advertisements (including inactive) - Admin only
 * @access  Private/Admin
 */
router.get('/admin/all', protect, authorize('admin'), getAllAdsAdmin);

/**
 * @route   GET /api/ads/admin/revenue
 * @desc    Get revenue statistics - Admin only
 * @access  Private/Admin
 */
router.get('/admin/revenue', protect, authorize('admin'), getRevenue);

/**
 * @route   POST /api/ads
 * @desc    Create new advertisement - Admin only
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), createAd);

/**
 * @route   PUT /api/ads/:id
 * @desc    Update advertisement - Admin only
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), updateAd);

/**
 * @route   DELETE /api/ads/:id
 * @desc    Delete advertisement - Admin only
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), deleteAd);

/**
 * @route   PUT /api/ads/:id/toggle
 * @desc    Toggle advertisement active status - Admin only
 * @access  Private/Admin
 */
router.put('/:id/toggle', protect, authorize('admin'), toggleAdStatus);

/**
 * @route   PUT /api/ads/:id/mark-paid
 * @desc    Mark advertisement as paid - Admin only
 * @access  Private/Admin
 */
router.put('/:id/mark-paid', protect, authorize('admin'), markAdPaid);

module.exports = router;
