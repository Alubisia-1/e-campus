const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  getActiveAds,
  getAdById,
  trackImpression,
  trackClick,
  getAdStats
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
 * @route   GET /api/ads/:id/click
 * @desc    Track advertisement click and redirect to ad link
 * @access  Public
 */
router.get('/:id/click', apiLimiter, trackClick);

/**
 * @route   GET /api/ads/:id/stats
 * @desc    Get advertisement statistics (impressions, clicks, CTR)
 * @access  Public
 */
router.get('/:id/stats', apiLimiter, getAdStats);

module.exports = router;
