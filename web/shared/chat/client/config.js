// Default config for the chat module.
// Apps can override by passing { apiBaseUrl, socketPath, getToken, getCurrentUserId } to ChatProvider.

export const DEFAULT_CONFIG = {
  apiBaseUrl: 'http://localhost:4000',
  apiPrefix: '/api/chat',
  socketPath: '/api/chat/socket.io',
  // function that returns the JWT token string (or null)
  getToken: () => {
    try {
      return localStorage.getItem('accessToken') || null;
    } catch {
      return null;
    }
  },
  // function that returns the current user id (string). REQUIRED.
  getCurrentUserId: () => null,
  // optional: resolve a userId to { id, name, avatar }. If not provided, ids are shown.
  resolveUser: null,
  // ms before the typing indicator is forgotten if no stop event arrives
  typingTimeoutMs: 4000,
};
