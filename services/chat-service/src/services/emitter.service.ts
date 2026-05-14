import { getIO, userRoom, conversationRoom } from '../config/socket';

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
} as const;

export const emitToUser = (userId: string, event: string, payload: any): void => {
  try {
    getIO().to(userRoom(userId)).emit(event, payload);
  } catch (err) {
    console.error('Chat Service: emitToUser failed', err);
  }
};

export const emitToConversation = (conversationId: string, event: string, payload: any): void => {
  try {
    getIO().to(conversationRoom(conversationId)).emit(event, payload);
  } catch (err) {
    console.error('Chat Service: emitToConversation failed', err);
  }
};

export const emitToUsers = (userIds: string[], event: string, payload: any): void => {
  for (const id of userIds) emitToUser(id, event, payload);
};

// Broadcast a message event to both the conversation room AND every participant's
// user room in a single de-duplicated call. socket.io guarantees each socket
// receives the event at most once even when in multiple matching rooms.
export const emitMessageEvent = (
  conversationId: string,
  userIds: string[],
  event: string,
  payload: any
): void => {
  try {
    const rooms = [conversationRoom(conversationId), ...userIds.map(userRoom)];
    getIO().to(rooms).emit(event, payload);
  } catch (err) {
    console.error('Chat Service: emitMessageEvent failed', err);
  }
};
