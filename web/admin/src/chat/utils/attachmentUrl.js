// Resolve an attachment URL against the current app's API base.
// The chat-service stores path-only URLs (/api/chat/uploads/X.jpg) so each
// client (web on ngrok, mobile on LAN) can render them against its own host.
// Legacy messages may have absolute URLs baked in from whichever host uploaded
// them; we normalize those by extracting the upload path and rebuilding
// against the local apiBaseUrl.
export const resolveAttachmentUrl = (raw, apiBaseUrl) => {
  if (!raw) return '';
  if (typeof raw !== 'string') return raw;
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  const base = (apiBaseUrl || '').replace(/\/+$/, '');
  const idx = raw.indexOf('/api/chat/uploads/');
  if (idx >= 0) return `${base}${raw.slice(idx)}`;
  return raw;
};
