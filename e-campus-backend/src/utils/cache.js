const NodeCache = require('node-cache');

/**
 * Cache configuration
 * - stdTTL: default time-to-live in seconds
 * - checkperiod: automatic delete check interval
 * - useClones: clone variables before returning from cache (safer but slower)
 */
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Better performance, be careful with mutations
});

/**
 * Cache utility functions
 */
const cacheUtils = {
  /**
   * Get value from cache
   */
  get: (key) => {
    try {
      const value = cache.get(key);
      if (value !== undefined) {
        console.log(`Cache HIT: ${key}`);
        return value;
      }
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL
   */
  set: (key, value, ttl = null) => {
    try {
      if (ttl) {
        cache.set(key, value, ttl);
      } else {
        cache.set(key, value);
      }
      console.log(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete specific key from cache
   */
  del: (key) => {
    try {
      cache.del(key);
      console.log(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Delete keys by pattern (e.g., 'products:*')
   */
  delPattern: (pattern) => {
    try {
      const keys = cache.keys();
      const matchingKeys = keys.filter(key => {
        // Convert pattern to regex (simple * wildcard support)
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(key);
      });

      if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
        console.log(`Cache DELETE pattern: ${pattern} (${matchingKeys.length} keys)`);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  /**
   * Clear all cache
   */
  flush: () => {
    try {
      cache.flushAll();
      console.log('Cache FLUSHED');
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  },

  /**
   * Get cache statistics
   */
  getStats: () => {
    return cache.getStats();
  },

  /**
   * Check if key exists
   */
  has: (key) => {
    return cache.has(key);
  },
};

/**
 * Cache key generators for consistency
 */
const cacheKeys = {
  // Categories
  categories: () => 'categories:all',
  category: (id) => `category:${id}`,

  // Products
  products: (params) => {
    const { page = 1, limit = 12, category, campus, search, sort } = params;
    return `products:p${page}:l${limit}:c${category || 'all'}:campus${campus || 'all'}:s${search || 'none'}:sort${sort || 'default'}`;
  },
  product: (id) => `product:${id}`,

  // Campuses
  campuses: () => 'campuses:all',

  // Ads
  ads: (position) => `ads:${position}`,

  // User listings
  userListings: (userId) => `user:${userId}:listings`,
};

/**
 * TTL presets (in seconds)
 */
const cacheTTL = {
  short: 60,        // 1 minute
  medium: 300,      // 5 minutes
  long: 1800,       // 30 minutes
  veryLong: 3600,   // 1 hour
  categories: 1800, // 30 minutes (categories rarely change)
  products: 120,    // 2 minutes (products change frequently)
  ads: 300,         // 5 minutes
};

module.exports = {
  cache: cacheUtils,
  cacheKeys,
  cacheTTL,
};
