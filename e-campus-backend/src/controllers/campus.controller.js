const Campus = require('../models/Campus.model');
const { validationResult } = require('express-validator');
const { cache, cacheKeys, cacheTTL } = require('../utils/cache');

/**
 * @desc    Get all active campuses
 * @route   GET /api/campuses
 * @access  Public
 */
exports.getAllCampuses = async (req, res) => {
  try {
    const cacheKey = 'campuses:all';
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    const campuses = await Campus.find({ isActive: true })
      .select('name slug city itemCount isActive')
      .sort('name')
      .lean();

    const responseData = {
      status: 'success',
      count: campuses.length,
      data: campuses
    };

    // Cache for 30 minutes (campuses rarely change)
    await cache.set(cacheKey, responseData, cacheTTL.categories);
    res.setHeader('X-Cache', 'MISS');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Get campuses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch campuses',
      error: error.message
    });
  }
};

/**
 * @desc    Get single campus by ID or slug
 * @route   GET /api/campuses/:id
 * @access  Public
 */
exports.getCampusById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let campus;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      campus = await Campus.findById(id);
    } else {
      campus = await Campus.findOne({ slug: id });
    }

    if (!campus) {
      return res.status(404).json({
        status: 'error',
        message: 'Campus not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: campus
    });
  } catch (error) {
    console.error('Get campus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch campus',
      error: error.message
    });
  }
};

/**
 * @desc    Create new campus (Admin only)
 * @route   POST /api/campuses
 * @access  Private/Admin
 */
exports.createCampus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { name, city } = req.body;

    // Check if campus already exists
    const existingCampus = await Campus.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCampus) {
      return res.status(400).json({
        status: 'error',
        message: 'A campus with this name already exists'
      });
    }

    const campus = await Campus.create({ name, city });

    // Clear cache
    await cache.del('campuses:all');

    res.status(201).json({
      status: 'success',
      message: 'Campus created successfully',
      data: campus
    });
  } catch (error) {
    console.error('Create campus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create campus',
      error: error.message
    });
  }
};

/**
 * @desc    Update campus (Admin only)
 * @route   PUT /api/campuses/:id
 * @access  Private/Admin
 */
exports.updateCampus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, city, isActive } = req.body;

    const campus = await Campus.findById(id);

    if (!campus) {
      return res.status(404).json({
        status: 'error',
        message: 'Campus not found'
      });
    }

    // Update fields
    if (name) campus.name = name;
    if (city !== undefined) campus.city = city;
    if (isActive !== undefined) campus.isActive = isActive;

    await campus.save();

    // Clear cache
    await cache.del('campuses:all');

    res.status(200).json({
      status: 'success',
      message: 'Campus updated successfully',
      data: campus
    });
  } catch (error) {
    console.error('Update campus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update campus',
      error: error.message
    });
  }
};

/**
 * @desc    Delete campus (Admin only)
 * @route   DELETE /api/campuses/:id
 * @access  Private/Admin
 */
exports.deleteCampus = async (req, res) => {
  try {
    const { id } = req.params;

    const campus = await Campus.findById(id);

    if (!campus) {
      return res.status(404).json({
        status: 'error',
        message: 'Campus not found'
      });
    }

    await Campus.findByIdAndDelete(id);

    // Clear cache
    await cache.del('campuses:all');

    res.status(200).json({
      status: 'success',
      message: 'Campus deleted successfully'
    });
  } catch (error) {
    console.error('Delete campus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete campus',
      error: error.message
    });
  }
};
