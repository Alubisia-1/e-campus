const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Admin Login Controller
 * Authenticates admin using password stored in environment variables
 */
exports.adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured in environment variables');
      return res.status(500).json({
        status: 'error',
        message: 'Admin authentication not configured'
      });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, adminPassword);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin password'
      });
    }

    // Generate JWT token for admin session
    const token = jwt.sign(
      {
        role: 'admin',
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Admin sessions expire after 24 hours
    );

    res.status(200).json({
      status: 'success',
      message: 'Admin authentication successful',
      data: {
        token,
        role: 'admin',
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Admin authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Admin Token
 * Validates that the user is an admin
 */
exports.verifyAdmin = async (req, res) => {
  try {
    // Check if admin token exists
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No admin token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized as admin'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin verified',
      data: {
        role: 'admin',
        valid: true
      }
    });

  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired admin token'
    });
  }
};
