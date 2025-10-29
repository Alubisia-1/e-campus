const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { createProductLimiter, searchLimiter } = require('../middleware/rateLimiter');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getMyListings,
  revealContact
} = require('../controllers/product.controller');

// Validation rules for creating product
const createProductValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('condition')
    .notEmpty()
    .withMessage('Condition is required')
    .isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair'])
    .withMessage('Invalid condition value'),
  body('images')
    .isArray({ min: 1, max: 3 })
    .withMessage('Please provide 1 to 3 product images'),
  body('images.*.url')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),
  body('images.*.publicId')
    .optional()
    .trim(),
  body('location.campus')
    .optional()
    .trim(),
  body('location.building')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  // Anonymous seller fields (required if not authenticated)
  body('anonymousSeller.deviceId')
    .optional()
    .trim(),
  body('anonymousSeller.phone')
    .optional()
    .trim(),
  body('anonymousSeller.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('anonymousSeller.whatsapp')
    .optional()
    .trim(),
  body('anonymousSeller.campus')
    .optional()
    .trim()
];

// Validation rules for updating product
const updateProductValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('condition')
    .optional()
    .isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair'])
    .withMessage('Invalid condition value'),
  body('status')
    .optional()
    .isIn(['available', 'sold', 'reserved', 'inactive'])
    .withMessage('Invalid status value'),
  body('location.campus')
    .optional()
    .trim(),
  body('location.building')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchLimiter, searchProducts);

// Protected routes (require authentication)
router.get('/user/my-listings', protect, getMyListings);
router.post('/', createProductLimiter, protect, createProductValidation, createProduct);
router.put('/:id', protect, updateProductValidation, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Public routes with :id parameter (must come after specific routes)
router.get('/:id', getProductById);
router.post('/:id/reveal-contact', revealContact);

module.exports = router;
