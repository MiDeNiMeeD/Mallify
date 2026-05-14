export const messagePreview = (msg) => {
  if (!msg) return '';
  if (msg.isDeletedForEveryone) return 'This message was deleted';
  // `lastMessage` on a conversation stores a precomputed `preview` string;
  // full message documents store `content`. Try both.
  const text = msg.preview ?? msg.content ?? '';
  switch (msg.messageType) {
    case 'image':
      return text || '📷 Photo';
    case 'video':
      return text || '🎬 Video';
    case 'audio':
      return text || '🎵 Audio';
    case 'voice':
      return text || '🎙️ Voice message';
    case 'file':
      return msg.attachments?.[0]?.name || text || '📎 File';
    case 'location':
      return text || '📍 Location';
    case 'system':
      return text;
    default:
      return text;
  }
};

export const isImageMime = (mime = '') => mime.startsWith('image/');
export const isVideoMime = (mime = '') => mime.startsWith('video/');
export const isAudioMime = (mime = '') => mime.startsWith('audio/');
