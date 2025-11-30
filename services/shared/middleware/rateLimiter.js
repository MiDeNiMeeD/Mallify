const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("redis");

/**
 * Create a rate limiter with Redis store
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
  } = options;

  // If Redis URL is provided, use Redis store
  if (process.env.REDIS_URL) {
    try {
      const redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        legacyMode: false,
      });

      redisClient.connect().catch(console.error);

      return rateLimit({
        store: new RedisStore({
          client: redisClient,
          prefix: "rl:",
        }),
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
      });
    } catch (error) {
      console.warn(
        "Redis connection failed, using memory store for rate limiting"
      );
    }
  }

  // Fallback to memory store
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
  });
};

/**
 * Strict rate limiter for auth endpoints
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * General API rate limiter
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

/**
 * Strict rate limiter for sensitive operations
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Rate limit exceeded for this operation.",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
};
