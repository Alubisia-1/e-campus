const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');

// Toggle to switch off all rate limiting (useful for local testing).
// Set DISABLE_RATE_LIMIT=true in .env. When on, every limiter below becomes a
// no-op pass-through so requests are never throttled.
const RATE_LIMIT_DISABLED = process.env.DISABLE_RATE_LIMIT === 'true';

if (RATE_LIMIT_DISABLED) {
  console.warn('⚠️  Rate limiting is DISABLED (DISABLE_RATE_LIMIT=true). Do not use this in production.');
}

const passThrough = (req, res, next) => next();

// When REDIS_URL is configured, rate-limit counters live in Redis so the limits
// are enforced across ALL backend instances (instead of per-process, which would
// effectively multiply every limit by the number of instances and reset on every
// deploy). Without REDIS_URL we fall back to express-rate-limit's in-memory store.
const useRedisStore = !!process.env.REDIS_URL;

// Each limiter needs its OWN store with a distinct prefix, otherwise they would
// share the same Redis counters and bleed into one another.
const makeStore = (prefix) => {
  if (!useRedisStore) return undefined; // undefined => default in-memory MemoryStore
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`
  });
};

// Returns a real limiter, or a pass-through when rate limiting is disabled.
// `prefix` namespaces the limiter's keys in Redis and is stripped before the
// options reach express-rate-limit.
const limiter = ({ prefix, ...options }) =>
  RATE_LIMIT_DISABLED ? passThrough : rateLimit({ ...options, store: makeStore(prefix) });

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = limiter({
  prefix: 'api',
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
  prefix: 'auth',
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
  prefix: 'upload',
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
  prefix: 'create-product',
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
  prefix: 'search',
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
  prefix: 'password-reset',
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
  prefix: 'reveal-hourly',
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
  prefix: 'reveal-daily',
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
