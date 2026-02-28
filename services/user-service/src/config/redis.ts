import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });
};

// Helper functions for Redis operations
export const setCache = async (key: string, value: any, expireSeconds?: number): Promise<void> => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  if (expireSeconds) {
    await redisClient.setEx(key, expireSeconds, stringValue);
  } else {
    await redisClient.set(key, stringValue);
  }
};

export const getCache = async (key: string): Promise<any> => {
  const value = await redisClient.get(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
