// Socket.io client wrapper. Lazy-imports socket.io-client so the chat module
// works in any host app — the consuming app must have socket.io-client installed.

let cachedIo = null;
const loadIo = async () => {
  if (cachedIo) return cachedIo;
  // eslint-disable-next-line import/no-extraneous-dependencies
  const mod = await import('socket.io-client');
  cachedIo = mod.io || mod.default || mod;
  return cachedIo;
};

export const createSocket = async (config) => {
  const io = await loadIo();
  const token = config.getToken?.();
  const socket = io(config.apiBaseUrl, {
    path: config.socketPath,
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    withCredentials: true,
  });
  return socket;
};

export const SOCKET_EVENTS = {
  MESSAGE_NEW: 'message:new',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_REACTION: 'message:reaction',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_PINNED: 'message:pinned',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_NEW: 'conversation:new',
  CONVERSATION_CLEARED: 'conversation:cleared',
  BLOCK_UPDATED: 'block:updated',
};
