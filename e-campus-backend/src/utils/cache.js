const NodeCache = require('node-cache');
const { redisClient, isRedisReady } = require('../config/redis');

/**
 * Caching layer with a Redis backend and an in-memory fallback.
 *
 * When Redis is connected (REDIS_URL configured), all cache state lives in Redis
 * so every backend instance shares the same cache and invalidations propagate
 * across the whole fleet. When Redis is unavailable, the same API transparently
 * falls back to a per-process node-cache so local dev / single-instance setups
 * keep working exactly as before.
 *
 * NOTE: the public methods are now async (they return Promises). Callers must
 * `await` get/set/del/delPattern.
 */

// In-memory fallback store (also used while Redis is still connecting).
const memCache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Better performance, be careful with mutations
});

// Namespace every Redis key so the cache can be flushed/scanned without touching
// other data (e.g. the rate limiter keys) sharing the same Redis instance.
const PREFIX = process.env.REDIS_PREFIX || 'cache:';
const rk = (key) => `${PREFIX}${key}`;

// Collect all keys matching a glob via SCAN (non-blocking, unlike KEYS).
// redis v5's scanIterator yields BATCHES (arrays of keys), not single keys.
const scanKeys = async (match) => {
  const found = [];
  for await (const batch of redisClient.scanIterator({ MATCH: match, COUNT: 100 })) {
    if (batch.length) found.push(...batch);
  }
  return found;
};

const cacheUtils = {
  /**
   * Get value from cache. Returns null on miss or error.
   */
  get: async (key) => {
    try {
      if (isRedisReady()) {
        const raw = await redisClient.get(rk(key));
        if (raw === null) {
          console.log(`Cache MISS: ${key}`);
          return null;
        }
        console.log(`Cache HIT: ${key}`);
        return JSON.parse(raw);
      }

      const value = memCache.get(key);
      if (value !== undefined) {
        console.log(`Cache HIT: ${key}`);
        return value;
      }
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (seconds).
   */
  set: async (key, value, ttl = null) => {
    try {
      if (isRedisReady()) {
        const payload = JSON.stringify(value);
        if (ttl) {
          await redisClient.set(rk(key), payload, { EX: ttl });
        } else {
          await redisClient.set(rk(key), payload);
        }
      } else if (ttl) {
        memCache.set(key, value, ttl);
      } else {
        memCache.set(key, value);
      }
      console.log(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  /**
   * Delete specific key from cache.
   */
  del: async (key) => {
    try {
      if (isRedisReady()) {
        await redisClient.del(rk(key));
      } else {
        memCache.del(key);
      }
      console.log(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  /**
   * Delete keys by pattern (e.g., 'products:*').
   */
  delPattern: async (pattern) => {
    try {
      if (isRedisReady()) {
        const keys = await scanKeys(rk(pattern));
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
        }
        return true;
      }

      const keys = memCache.keys();
      // Escape regex metacharacters except '*', then turn '*' into '.*'.
      const regex = new RegExp(
        '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'
      );
      const matchingKeys = keys.filter((key) => regex.test(key));
      if (matchingKeys.length > 0) {
        memCache.del(matchingKeys);
        console.log(`Cache DELETE pattern: ${pattern} (${matchingKeys.length} keys)`);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return false;
    }
  },

  /**
   * Clear all cache entries owned by this app (namespace-scoped on Redis).
   */
  flush: async () => {
    try {
      if (isRedisReady()) {
        const keys = await scanKeys(rk('*'));
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        memCache.flushAll();
      }
      console.log('Cache FLUSHED');
      return true;
    } catch (error) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  },

  /**
   * Cache statistics (backend-aware).
   */
  getStats: () => {
    if (isRedisReady()) {
      return { backend: 'redis' };
    }
    return { backend: 'memory', ...memCache.getStats() };
  },

  /**
   * Check if key exists.
   */
  has: async (key) => {
    try {
      if (isRedisReady()) {
        return (await redisClient.exists(rk(key))) === 1;
      }
      return memCache.has(key);
    } catch (error) {
      console.error('Cache has error:', error.message);
      return false;
    }
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
