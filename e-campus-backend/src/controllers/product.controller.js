const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const { deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const { cache, cacheKeys, cacheTTL } = require('../utils/cache');

/**
 * @desc    Get all products with filters and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      condition,
      status = 'available',
      isOfficialStore
    } = req.query;

    // Generate cache key
    const cacheKey = cacheKeys.products({
      page,
      limit,
      category,
      search,
      status,
      isOfficialStore
    });

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    // Build filter object
    const filter = { isActive: true };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by official store
    if (isOfficialStore === 'true') {
      filter.isOfficialStore = true;
    } else if (isOfficialStore === 'false') {
      filter.isOfficialStore = { $ne: true };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by condition
    if (condition) {
      filter.condition = condition;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search in title and description (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use aggregation to get count and products in one query (more efficient)
    const [countResult, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('seller', 'username campus') // Only select needed fields
        .populate('category', 'name slug')     // Only select needed fields
        .sort({ 'sponsored.isSponsored': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean() // Convert to plain JS objects (faster)
    ]);

    const responseData = {
      status: 'success',
      data: {
        products,
        pagination: {
          total: countResult,
          currentPage: parseInt(page),
          totalPages: Math.ceil(countResult / parseInt(limit)),
          limit: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(countResult / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    };

    // Cache the response for 2 minutes
    cache.set(cacheKey, responseData, cacheTTL.products);
    res.setHeader('X-Cache', 'MISS');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product (hide contact info for privacy - use reveal endpoint)
    const product = await Product.findById(id)
      .populate('seller', 'name campus avatar bio createdAt')
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment view count asynchronously (don't block response)
    // Use updateOne to avoid triggering full document validation and middleware
    Product.updateOne({ _id: id }, { $inc: { views: 1 } }).exec().catch(err => {
      console.error('Failed to increment view count:', err);
    });

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 */
exports.createProduct = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      tags,
      contact,
      isOfficialStore
    } = req.body;

    // Validate images array (1-3 URLs)
    if (!images || !Array.isArray(images) || images.length < 1 || images.length > 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide 1 to 3 product images'
      });
    }

    // Create product data (user is authenticated via protect middleware)
    const productData = {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      tags: tags || [],
      contact,
      seller: req.user.id,
      // Set official store status (only if explicitly set to true)
      isOfficialStore: isOfficialStore === true
    };

    // Create product
    const product = await Product.create(productData);

    // Update user's listings
    await User.findByIdAndUpdate(req.user.id, {
      $push: { listings: product._id }
    });

    // Invalidate product caches
    cache.delPattern('products:*');
    cache.delPattern('official:*');
    if (category) {
      cache.del(cacheKeys.category(category));
    }

    // Populate product data
    await product.populate('seller', 'username phone whatsapp campus');
    await product.populate('category', 'name slug');

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product',
      error: error.message
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this product'
      });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'title',
      'description',
      'price',
      'category',
      'condition',
      'status',
      'location',
      'tags'
    ];

    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    // Populate product data
    await product.populate('seller', 'name phone email whatsapp');
    await product.populate('category', 'name slug');

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
      error: error.message
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check ownership (owner or admin)
    const isOwner = product.seller.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this product'
      });
    }

    // Delete associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          if (image.publicId) {
            try {
              await deleteFromCloudinary(image.publicId);
            } catch (err) {
              console.error('Error deleting image:', err);
            }
          }
        })
      );
    }

    // Remove product from user's listings
    await User.findByIdAndUpdate(product.seller, {
      $pull: { listings: product._id }
    });

    // Delete product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

/**
 * @desc    Search products (full-text search)
 * @route   GET /api/products/search
 * @access  Public
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Full-text search using MongoDB text index (hide contact for privacy)
    const products = await Product.find(
      {
        $text: { $search: q },
        isActive: true,
        status: 'available'
      },
      {
        score: { $meta: 'textScore' }
      }
    )
      .populate('seller', 'name campus avatar')
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Product.countDocuments({
      $text: { $search: q },
      isActive: true,
      status: 'available'
    });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        query: q,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search products',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's products
 * @route   GET /api/products/my-listings
 * @access  Private
 */
exports.getMyListings = async (req, res) => {
  try {
    const { page = 1, limit = 12, status, deviceId } = req.query;

    let filter = {};

    // Filter by authenticated user's products
    filter.seller = req.user.id;

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your listings',
      error: error.message
    });
  }
};

/**
 * @desc    Reveal seller contact information
 * @route   POST /api/products/:id/reveal-contact
 * @access  Public
 */
exports.revealContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and populate seller info
    const product = await Product.findById(id)
      .populate('seller', 'username name campus');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment contact reveals counter
    product.contactReveals += 1;
    await product.save();

    // Return seller contact information from the product listing
    const contactData = {
      name: product.seller.name || product.seller.username,
      username: product.seller.username,
      email: product.contact.email,
      phone: product.contact.phone,
      whatsapp: product.contact.phone, // Use same phone for WhatsApp
      campus: product.location.campus || product.seller.campus
    };

    res.status(200).json({
      status: 'success',
      data: {
        contact: contactData,
        contactReveals: product.contactReveals
      }
    });
  } catch (error) {
    console.error('Reveal contact error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to reveal contact information',
      error: error.message
    });
  }
};

/**
 * @desc    Mark product as sponsored - Admin only
 * @route   PUT /api/products/:id/sponsor
 * @access  Private/Admin
 */
exports.sponsorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, amount, period } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    product.sponsored = {
      isSponsored: true,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
      pricing: {
        amount: amount || 500,
        currency: 'KSH',
        period: period || 'week'
      },
      paymentStatus: 'pending'
    };

    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product marked as sponsored',
      data: { product }
    });
  } catch (error) {
    console.error('Sponsor product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sponsor product',
      error: error.message
    });
  }
};

/**
 * @desc    Remove sponsored status from product - Admin only
 * @route   PUT /api/products/:id/unsponsor
 * @access  Private/Admin
 */
exports.unsponsorProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    product.sponsored.isSponsored = false;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Sponsored status removed',
      data: { product }
    });
  } catch (error) {
    console.error('Unsponsor product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsponsor product',
      error: error.message
    });
  }
};
