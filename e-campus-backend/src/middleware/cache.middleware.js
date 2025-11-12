const { cache, cacheTTL } = require('../utils/cache');

/**
 * Cache middleware for Express routes
 * Usage: router.get('/endpoint', cacheMiddleware(300), controller)
 */
function cacheMiddleware(duration = cacheTTL.medium) {
  return (req, res, next) => {
    // Don't cache if explicitly disabled
    if (req.query.nocache === 'true') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = generateCacheKey(req);

    // Try to get from cache
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Add cache hit header
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', key);
      return res.json(cachedResponse);
    }

    // Cache miss - continue to route handler
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Key', key);

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, body, duration);
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
  // Include method, path, and sorted query params
  const method = req.method;
  const path = req.path;

  // Sort query params for consistent keys
  const query = Object.keys(req.query)
    .sort()
    .map(key => `${key}=${req.query[key]}`)
    .join('&');

  return `${method}:${path}${query ? '?' + query : ''}`;
}

/**
 * Clear cache for specific patterns
 * Usage: router.post('/endpoint', clearCacheMiddleware('products:*'), controller)
 */
function clearCacheMiddleware(patterns) {
  return (req, res, next) => {
    // Store patterns to clear after response
    req.cachePatternsToFocus = Array.isArray(patterns) ? patterns : [patterns];
    next();
  };
}

/**
 * Middleware to clear cache after successful mutations
 */
function clearCacheAfterResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    // Only clear cache on successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (req.cachePatternsToFlush) {
        req.cachePatternsToFlush.forEach(pattern => {
          cache.delPattern(pattern);
        });
      }
    }
    return originalJson(body);
  };

  next();
}

module.exports = {
  cacheMiddleware,
  clearCacheMiddleware,
  clearCacheAfterResponse,
};
