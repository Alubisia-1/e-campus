const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  deleteCampus
} = require('../controllers/campus.controller');

// Validation rules
const campusValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Campus name is required')
    .isLength({ max: 100 })
    .withMessage('Campus name cannot exceed 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters')
];

// Public routes
router.get('/', getAllCampuses);
router.get('/:id', getCampusById);

// Admin routes
router.post('/', protect, authorize('admin'), campusValidation, createCampus);
router.put('/:id', protect, authorize('admin'), campusValidation, updateCampus);
router.delete('/:id', protect, authorize('admin'), deleteCampus);

module.exports = router;
