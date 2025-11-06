const express = require('express');
const router = express.Router();
const { adminLogin, verifyAdmin } = require('../controllers/admin.controller');
const { body } = require('express-validator');

/**
 * @route   POST /api/admin/login
 * @desc    Admin login with password
 * @access  Public
 */
router.post(
  '/login',
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  adminLogin
);

/**
 * @route   GET /api/admin/verify
 * @desc    Verify admin token
 * @access  Protected (Admin only)
 */
router.get('/verify', verifyAdmin);

module.exports = router;
