const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  uploadProductImages,
  deleteImage,
  uploadAvatar
} = require('../controllers/upload.controller');

/**
 * @route   POST /api/upload/product-images
 * @desc    Upload product images (max 3)
 * @access  Private
 */
router.post(
  '/product-images',
  uploadLimiter,
  protect,
  upload.array('images', 3),
  handleMulterError,
  uploadProductImages
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  '/avatar',
  uploadLimiter,
  protect,
  upload.single('avatar'),
  handleMulterError,
  uploadAvatar
);

/**
 * @route   DELETE /api/upload/image/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image/:publicId', protect, deleteImage);

module.exports = router;
