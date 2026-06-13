const rateLimit = require('express-rate-limit');

// Toggle to switch off all rate limiting (useful for local testing).
// Set DISABLE_RATE_LIMIT=true in .env. When on, every limiter below becomes a
// no-op pass-through so requests are never throttled.
const RATE_LIMIT_DISABLED = process.env.DISABLE_RATE_LIMIT === 'true';

if (RATE_LIMIT_DISABLED) {
  console.warn('⚠️  Rate limiting is DISABLED (DISABLE_RATE_LIMIT=true). Do not use this in production.');
}

const passThrough = (req, res, next) => next();

// Returns a real limiter, or a pass-through when rate limiting is disabled.
const limiter = (options) => (RATE_LIMIT_DISABLED ? passThrough : rateLimit(options));

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests to not penalize normal usage
  skipSuccessfulRequests: false
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Only count failed attempts
});

/**
 * Upload rate limiter
 * 10 requests per hour per IP
 */
const uploadLimiter = limiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    status: 'error',
    message: 'Too many upload requests, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create product rate limiter
 * 20 products per day per IP
 */
const createProductLimiter = limiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: {
    status: 'error',
    message: 'Maximum product creation limit reached. Please try again tomorrow'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Search rate limiter (prevent search abuse)
 * 50 searches per 15 minutes per IP
 */
const searchLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    status: 'error',
    message: 'Too many search requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP (prevent abuse)
 */
const passwordResetLimiter = limiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    status: 'error',
    message: 'Too many password reset attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Contact reveal rate limiters (stop bulk harvesting of seller contacts)
 * Stacked: 15 reveals per hour AND 40 reveals per day, per IP.
 */
const revealContactHourlyLimiter = limiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: {
    status: 'error',
    message: 'Too many contact reveals. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const revealContactDailyLimiter = limiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 40,
  message: {
    status: 'error',
    message: 'Daily contact reveal limit reached. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  createProductLimiter,
  searchLimiter,
  passwordResetLimiter,
  revealContactHourlyLimiter,
  revealContactDailyLimiter
};
