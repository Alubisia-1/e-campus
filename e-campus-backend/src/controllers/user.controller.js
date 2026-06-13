const User = require('../models/User.model');
const Product = require('../models/Product.model');

// @desc    List all users (with optional search + pagination)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    // Build query — case-insensitive match on username or email
    const query = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ username: regex }, { email: regex }, { name: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('username name email phone campus role isVerified createdAt listings')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map((u) => ({
          id: u._id,
          username: u.username,
          name: u.name,
          email: u.email,
          phone: u.phone,
          campus: u.campus,
          role: u.role,
          isVerified: u.isVerified,
          listingsCount: Array.isArray(u.listings) ? u.listings.length : 0,
          createdAt: u.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching users',
      error: error.message
    });
  }
};

// @desc    Get a single user by id (with their live listings count)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username name email phone whatsapp campus bio avatar role isVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const listingsCount = await Product.countDocuments({ seller: user._id });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          campus: user.campus,
          bio: user.bio,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          listingsCount,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching user',
      error: error.message
    });
  }
};

// @desc    Delete a user account and cascade-remove their data
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // An admin must not delete their own account through this route
    if (id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own admin account here. Use account settings instead.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Safety: protect other admin accounts from accidental deletion
    if (user.role === 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin accounts cannot be deleted from here. Demote the account first (or remove it via the server).'
      });
    }

    // Cascade: remove this user's listings, and pull them from any saved lists
    await Product.deleteMany({ seller: user._id });
    await Product.updateMany(
      { savedBy: user._id },
      { $pull: { savedBy: user._id } }
    );

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      status: 'success',
      message: `User "${user.username}" and all their listings have been deleted`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting user',
      error: error.message
    });
  }
};
