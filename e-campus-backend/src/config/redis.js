const { createClient } = require('redis');

/**
 * Shared Redis connection.
 *
 * This single client is reused by both the cache layer (utils/cache.js) and the
 * rate limiter (middleware/rateLimiter.js) so the whole backend can run as
 * multiple stateless instances behind a load balancer.
 *
 * Redis is OPTIONAL and gated entirely on REDIS_URL:
 *   - REDIS_URL set   -> distributed cache + rate limiting (production / multi-instance)
 *   - REDIS_URL unset -> in-memory cache + rate limiting (single instance / local dev)
 *
 * Connecting happens in the background and never blocks app startup. If Redis is
 * configured but temporarily unreachable, the cache transparently falls back to
 * the in-memory store and the client keeps trying to reconnect.
 */

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      // Reconnect forever with capped exponential-ish backoff so a transient
      // Redis blip auto-recovers instead of permanently degrading the service.
      reconnectStrategy: (retries) => Math.min(retries * 200, 5000)
    }
  });

  // Avoid log spam: only report the first error until the next successful connect.
  redisClient.on('error', (err) => {
    if (!redisClient._errorLogged) {
      console.error('⚠️  Redis error (falling back to in-memory cache):', err.message);
      redisClient._errorLogged = true;
    }
  });

  redisClient.on('ready', () => {
    redisClient._errorLogged = false;
    console.log('✅ Redis connected — distributed cache & rate limiting enabled');
  });

  redisClient.on('reconnecting', () => {
    console.log('… Redis reconnecting');
  });

  // Kick off the connection without blocking module load / server startup.
  redisClient.connect().catch((err) => {
    console.error('⚠️  Redis initial connection failed, using in-memory cache:', err.message);
  });
} else {
  console.log('ℹ️  REDIS_URL not set — using in-memory cache & rate limiting (single instance only)');
}

/**
 * True only when the client exists and the connection is live. Callers use this
 * to decide between Redis and the in-memory fallback on every operation.
 */
const isRedisReady = () => !!redisClient && redisClient.isReady;

module.exports = { redisClient, isRedisReady };
