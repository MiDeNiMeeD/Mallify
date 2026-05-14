// REST client for the chat-service. Uses fetch and reads the JWT via getToken().
// All endpoints are relative to `${apiBaseUrl}${apiPrefix}` (default: http://localhost:4000/api/chat).

const qs = (params) => {
  const cleaned = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return cleaned ? `?${cleaned}` : '';
};

export class ChatClient {
  constructor(config) {
    this.config = config;
  }

  url(path, params) {
    const { apiBaseUrl, apiPrefix } = this.config;
    return `${apiBaseUrl}${apiPrefix}${path}${qs(params)}`;
  }

  async request(path, { method = 'GET', body, params, headers = {}, isForm = false } = {}) {
    const token = this.config.getToken?.();
    const finalHeaders = { ...headers };
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
    if (!isForm && body !== undefined) finalHeaders['Content-Type'] = 'application/json';

    const res = await fetch(this.url(path, params), {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const err = new Error(payload?.error || payload?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  }

  // ── Conversations ──────────────────────────────────────────────────────────
  listConversations({ archived = false, cursor, limit = 30 } = {}) {
    return this.request('/conversations', { params: { archived, cursor, limit } });
  }

  openOrCreateConversation(userId) {
    return this.request('/conversations', { method: 'POST', body: { userId } });
  }

  getConversation(id) {
    return this.request(`/conversations/${id}`);
  }

  togglePin(id) {
    return this.request(`/conversations/${id}/pin`, { method: 'PATCH' });
  }

  toggleArchive(id) {
    return this.request(`/conversations/${id}/archive`, { method: 'PATCH' });
  }

  toggleMute(id, durationHours) {
    return this.request(`/conversations/${id}/mute`, {
      method: 'PATCH',
      body: { durationHours },
    });
  }

  markRead(id) {
    return this.request(`/conversations/${id}/read`, { method: 'POST' });
  }

  clearHistory(id) {
    return this.request(`/conversations/${id}/clear`, { method: 'POST' });
  }

  deleteConversation(id) {
    return this.request(`/conversations/${id}`, { method: 'DELETE' });
  }

  listPinnedMessages(id) {
    return this.request(`/conversations/${id}/pinned`);
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  listMessages(conversationId, { before, after, limit = 30 } = {}) {
    return this.request(`/messages/conversation/${conversationId}`, {
      params: { before, after, limit },
    });
  }

  sendMessage(payload) {
    return this.request('/messages', { method: 'POST', body: payload });
  }

  editMessage(id, content) {
    return this.request(`/messages/${id}`, { method: 'PATCH', body: { content } });
  }

  deleteMessage(id, scope = 'me') {
    return this.request(`/messages/${id}`, { method: 'DELETE', params: { scope } });
  }

  reactToMessage(id, emoji) {
    return this.request(`/messages/${id}/react`, { method: 'POST', body: { emoji } });
  }

  removeReaction(id) {
    return this.request(`/messages/${id}/react`, { method: 'DELETE' });
  }

  pinMessage(id) {
    return this.request(`/messages/${id}/pin`, { method: 'POST' });
  }

  forwardMessage(id, { targetUserIds = [], targetConversationIds = [] } = {}) {
    return this.request(`/messages/${id}/forward`, {
      method: 'POST',
      body: { targetUserIds, targetConversationIds },
    });
  }

  markDelivered(messageIds) {
    return this.request('/messages/delivered', {
      method: 'POST',
      body: { messageIds },
    });
  }

  searchMessages({ q, conversationId, limit = 20 } = {}) {
    return this.request('/messages/search', { params: { q, conversationId, limit } });
  }

  // ── Attachments ───────────────────────────────────────────────────────────
  async uploadAttachments(files) {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    return this.request('/attachments', { method: 'POST', body: fd, isForm: true });
  }

  // ── Blocks ────────────────────────────────────────────────────────────────
  listBlocks() {
    return this.request('/blocks');
  }
  blockUser(userId, reason) {
    return this.request('/blocks', { method: 'POST', body: { userId, reason } });
  }
  unblockUser(userId) {
    return this.request(`/blocks/${userId}`, { method: 'DELETE' });
  }
  checkBlock(userId) {
    return this.request(`/blocks/check/${userId}`);
  }

  // ── Presence ──────────────────────────────────────────────────────────────
  getPresence(userId) {
    return this.request(`/presence/${userId}`);
  }
  getPresenceBatch(userIds) {
    return this.request('/presence/batch', { params: { userIds: userIds.join(',') } });
  }

  // ── Contacts (role-aware) ─────────────────────────────────────────────────
  getContacts({ q, role, page, limit } = {}) {
    return this.request('/contacts', { params: { q, role, page, limit } });
  }
  resolveUsers(ids) {
    return this.request('/contacts/resolve', { params: { ids: ids.join(',') } });
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  reportContent({ messageId, reportedUserId, reason, description } = {}) {
    return this.request('/reports', {
      method: 'POST',
      body: { messageId, reportedUserId, reason, description },
    });
  }
}
