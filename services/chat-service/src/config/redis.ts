import Redis from 'ioredis';

let client: Redis | null = null;
let subscriber: Redis | null = null;

const buildOptions = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: false,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis(buildOptions());
    client.on('error', (err) => console.error('Chat Service: Redis error', err));
    client.on('connect', () => console.log('Chat Service: Redis connected'));
  }
  return client;
};

export const getRedisSubscriber = (): Redis => {
  if (!subscriber) {
    subscriber = new Redis(buildOptions());
    subscriber.on('error', (err) => console.error('Chat Service: Redis subscriber error', err));
  }
  return subscriber;
};

export const closeRedis = async (): Promise<void> => {
  if (client) {
    await client.quit();
    client = null;
  }
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
};
