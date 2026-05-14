import { getRedis } from '../config/redis';

const ONLINE_TTL_SECONDS = 60;
const SOCKET_KEY = (userId: string) => `presence:user:${userId}:sockets`;
const LAST_SEEN_KEY = (userId: string) => `presence:user:${userId}:last_seen`;

export const addSocket = async (userId: string, socketId: string): Promise<number> => {
  const redis = getRedis();
  const count = await redis.sadd(SOCKET_KEY(userId), socketId);
  await redis.expire(SOCKET_KEY(userId), ONLINE_TTL_SECONDS * 10);
  return count;
};

export const removeSocket = async (userId: string, socketId: string): Promise<number> => {
  const redis = getRedis();
  await redis.srem(SOCKET_KEY(userId), socketId);
  const remaining = await redis.scard(SOCKET_KEY(userId));
  if (remaining === 0) {
    await redis.set(LAST_SEEN_KEY(userId), Date.now().toString(), 'EX', 60 * 60 * 24 * 30);
  }
  return remaining;
};

export const isOnline = async (userId: string): Promise<boolean> => {
  const redis = getRedis();
  const count = await redis.scard(SOCKET_KEY(userId));
  return count > 0;
};

export const getOnlineMap = async (
  userIds: string[]
): Promise<Record<string, { online: boolean; lastSeen: number | null }>> => {
  const redis = getRedis();
  const result: Record<string, { online: boolean; lastSeen: number | null }> = {};
  if (!userIds.length) return result;

  const pipeline = redis.pipeline();
  for (const id of userIds) {
    pipeline.scard(SOCKET_KEY(id));
    pipeline.get(LAST_SEEN_KEY(id));
  }
  const replies = await pipeline.exec();
  if (!replies) return result;

  userIds.forEach((id, idx) => {
    const socketCount = Number(replies[idx * 2]?.[1] || 0);
    const lastSeenRaw = replies[idx * 2 + 1]?.[1];
    result[id] = {
      online: socketCount > 0,
      lastSeen: lastSeenRaw ? Number(lastSeenRaw) : null,
    };
  });
  return result;
};

export const touchLastSeen = async (userId: string): Promise<void> => {
  const redis = getRedis();
  await redis.set(LAST_SEEN_KEY(userId), Date.now().toString(), 'EX', 60 * 60 * 24 * 30);
};

export const getLastSeen = async (userId: string): Promise<number | null> => {
  const redis = getRedis();
  const val = await redis.get(LAST_SEEN_KEY(userId));
  return val ? Number(val) : null;
};
