import React, { useEffect, useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '../context/ChatProvider';
import { useMessages } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'nudity', label: 'Nudity / explicit' },
  { value: 'violence', label: 'Violence' },
  { value: 'scam', label: 'Scam' },
  { value: 'illegal', label: 'Illegal activity' },
  { value: 'other', label: 'Other' },
];

export const ChatThread = ({ conversation, onBack, onConversationChanged }) => {
  const { client, currentUserId, resolveUser, markConversationRead } = useChat();
  const conversationId = conversation?.id;
  const peerId = conversation?.peerId;

  // Don't memoize — resolveUser is a stable callback but its return value
  // changes when the user cache fills. Recomputing each render is cheap.
  const peer = peerId ? { id: peerId, ...(resolveUser(peerId) || {}) } : null;

  const peerIds = peerId ? [peerId] : [];
  const presenceMap = usePresence(peerIds);
  const presence = peerId ? presenceMap[peerId] : null;

  const {
    messages,
    loading,
    hasMore: hasMoreOlder,
    loadOlder,
    sendText,
    sendAttachment,
    editMessage,
    deleteMessage,
    react,
    unreact,
  } = useMessages(conversationId);

  const { typingUsers, notifyTyping, stopTyping } = useTyping(conversationId);

  const [replyingTo, setReplyingTo] = useState(null);

  // Drop the sidebar badge counter immediately when a conversation is opened,
  // then mark as read on the server in the background.
  useEffect(() => {
    if (!conversationId) return;
    markConversationRead(conversationId);
  }, [conversationId, markConversationRead]);

  // Mark as read whenever the thread is visible and new messages arrive
  useEffect(() => {
    if (!conversationId || !messages.length) return;
    const hasUnread = messages.some(
      (m) =>
        String(m.receiverId) === String(currentUserId) &&
        !(m.readBy || []).some((r) => String(r.userId) === String(currentUserId))
    );
    if (!hasUnread) return;
    const t = setTimeout(() => {
      markConversationRead(conversationId).then(() => onConversationChanged?.());
    }, 300);
    return () => clearTimeout(t);
  }, [conversationId, messages, currentUserId, markConversationRead, onConversationChanged]);

  if (!conversation) {
    return (
      <div className="mc-thread mc-thread-empty">
        <div className="mc-empty">Select a chat to start messaging</div>
      </div>
    );
  }

  const handleSendText = async (text) => {
    await sendText(text, { receiverId: peerId, replyTo: replyingTo?._id });
    setReplyingTo(null);
  };

  const handleSendFiles = async (files, caption) => {
    await sendAttachment(files, { receiverId: peerId, caption, replyTo: replyingTo?._id });
    setReplyingTo(null);
  };

  const handleDelete = (msg, scope) => {
    if (scope === 'everyone' && !window.confirm('Delete this message for everyone?')) return;
    deleteMessage(msg._id, scope);
  };

  const handlePin = async (msg) => {
    try {
      await client.pinMessage(msg._id);
    } catch {}
  };

  const handleReport = async (msg) => {
    const reason = window.prompt(
      `Report this message. Reasons: ${REPORT_REASONS.map((r) => r.value).join(', ')}`
    );
    if (!reason) return;
    try {
      await client.reportContent({ messageId: msg._id, reason });
      alert('Reported. Thanks for letting us know.');
    } catch (e) {
      alert(`Could not report: ${e.message}`);
    }
  };

  const handleForward = async (msg) => {
    const target = window.prompt('Forward to user id:');
    if (!target) return;
    try {
      await client.forwardMessage(msg._id, { targetUserIds: [target.trim()] });
    } catch (e) {
      alert(`Could not forward: ${e.message}`);
    }
  };

  const handleHeaderAction = {
    togglePin: () => client.togglePin(conversationId).then(() => onConversationChanged?.()),
    toggleArchive: () =>
      client.toggleArchive(conversationId).then(() => onConversationChanged?.()),
    toggleMute: () => client.toggleMute(conversationId).then(() => onConversationChanged?.()),
    clearHistory: () => {
      if (!window.confirm('Clear this chat for yourself?')) return;
      client.clearHistory(conversationId).then(() => onConversationChanged?.());
    },
    deleteConversation: () => {
      if (!window.confirm('Delete this conversation?')) return;
      client
        .deleteConversation(conversationId)
        .then(() => onConversationChanged?.(true))
        .catch(() => {});
    },
    block: () => {
      if (!peerId || !window.confirm('Block this user?')) return;
      client.blockUser(peerId).catch(() => {});
    },
    report: () => {
      const reason = window.prompt(
        `Report this user. Reasons: ${REPORT_REASONS.map((r) => r.value).join(', ')}`
      );
      if (!reason) return;
      client.reportContent({ reportedUserId: peerId, reason }).catch(() => {});
    },
  };

  return (
    <div className="mc-thread">
      <ChatHeader
        peer={peer}
        presence={presence}
        onBack={onBack}
        onTogglePin={handleHeaderAction.togglePin}
        onToggleArchive={handleHeaderAction.toggleArchive}
        onToggleMute={handleHeaderAction.toggleMute}
        onClearHistory={handleHeaderAction.clearHistory}
        onDeleteConversation={handleHeaderAction.deleteConversation}
        onBlock={handleHeaderAction.block}
        onReport={handleHeaderAction.report}
        isPinned={conversation.isPinned}
        isArchived={conversation.isArchived}
        isMuted={conversation.isMuted}
      />

      <MessageList
        messages={messages}
        loadingOlder={loading}
        hasMoreOlder={hasMoreOlder}
        onLoadOlder={loadOlder}
        myUserId={currentUserId}
        peer={peer}
        isPeerOnline={presence?.online}
        onReact={react}
        onUnreact={unreact}
        onEdit={editMessage}
        onDelete={handleDelete}
        onReply={(msg) => setReplyingTo(msg)}
        onPin={handlePin}
        onForward={handleForward}
        onReport={handleReport}
        resolveUser={resolveUser}
      />

      <TypingIndicator
        typingUsers={typingUsers}
        resolveName={(id) => resolveUser(id)?.name}
      />

      <MessageInput
        onSendText={handleSendText}
        onSendFiles={handleSendFiles}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};
