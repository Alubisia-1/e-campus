const Category = require('../models/Category.model');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .select('name slug description icon color productCount')
    .sort('name');

  res.status(200).json({
    status: 'success',
    count: categories.length,
    data: categories
  });
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: category
  });
});