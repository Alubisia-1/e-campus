const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const asyncHandler = require('../middleware/asyncHandler');
const { cache, cacheKeys, cacheTTL } = require('../utils/cache');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  // Check cache first (categories rarely change)
  const cacheKey = cacheKeys.categories();
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cachedData);
  }

  // Fetch from database
  const categories = await Category.find({ isActive: true })
    .select('name slug description icon color')
    .sort('name')
    .lean(); // Use lean() for better performance

  // Compute live product counts per category in a single aggregation so the
  // category list shows accurate counts without the client loading every product.
  const counts = await Product.aggregate([
    { $match: { isActive: true, status: 'available' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const countByCategory = counts.reduce((acc, c) => {
    if (c._id) acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    productCount: countByCategory[cat._id.toString()] || 0
  }));

  const responseData = {
    status: 'success',
    count: categoriesWithCounts.length,
    data: categoriesWithCounts
  };

  // Cache for 30 minutes (categories rarely change)
  cache.set(cacheKey, responseData, cacheTTL.categories);
  res.setHeader('X-Cache', 'MISS');

  res.status(200).json(responseData);
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