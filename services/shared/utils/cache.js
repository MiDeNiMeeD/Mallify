const redis = require("redis");

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      if (this.isConnected) {
        return this.client;
      }

      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      this.client = redis.createClient({
        url: redisUrl,
        legacyMode: false,
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Connected to Redis");
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      this.isConnected = false;
      return null;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) return null;

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache with expiration
   */
  async set(key, value, expirationInSeconds = 3600) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) return false;

      await this.client.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) return false;

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) return false;

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      if (!this.client) return false;

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
      }
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
