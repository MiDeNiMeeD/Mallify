// Public API of the shared chat module.

export { ChatProvider, useChat, useResolvedUser } from './context/ChatProvider';

export { ChatClient } from './client/chatClient';
export { createSocket, SOCKET_EVENTS } from './client/socketClient';
export { DEFAULT_CONFIG } from './client/config';

export { useConversations } from './hooks/useConversations';
export { useMessages } from './hooks/useMessages';
export { useTyping } from './hooks/useTyping';
export { usePresence } from './hooks/usePresence';
export { useContacts } from './hooks/useContacts';
export { useUserDirectory } from './hooks/useUserDirectory';

export { ChatLayout } from './components/ChatLayout';
export { ConversationList } from './components/ConversationList';
export { ChatThread } from './components/ChatThread';
export { ChatHeader } from './components/ChatHeader';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { MessageInput } from './components/MessageInput';
export { TypingIndicator } from './components/TypingIndicator';
export { NewChatPicker } from './components/NewChatPicker';
export { Lightbox } from './components/Lightbox';
export { Avatar } from './components/Avatar';

export {
  formatRelativeTime,
  formatClockTime,
  formatLastSeen,
  formatBytes,
  groupMessagesByDay,
} from './utils/format';
export { messagePreview } from './utils/preview';
