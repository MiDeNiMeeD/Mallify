import React, { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { formatRelativeTime } from '../utils/format';
import { messagePreview } from '../utils/preview';
import { useChat } from '../context/ChatProvider';
import { useConversations } from '../hooks/useConversations';
import { usePresence } from '../hooks/usePresence';

export const ConversationList = ({
  activeConversationId,
  onSelect,
  onNewChat,
  className = '',
  showSearch = true,
  showNewChat = true,
}) => {
  const { currentUserId, resolveUser } = useChat();
  const { conversations, loading, hasMore, loadMore, refresh } = useConversations();
  const [query, setQuery] = useState('');

  const peerIds = useMemo(
    () => conversations.map((c) => c.peerId).filter(Boolean),
    [conversations]
  );
  const presence = usePresence(peerIds);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const peer = resolveUser(c.peerId);
      const name = (peer?.name || c.peerId || '').toLowerCase();
      const lastText = (c.lastMessage?.preview || '').toLowerCase();
      return name.includes(q) || lastText.includes(q);
    });
  }, [conversations, query, resolveUser]);

  return (
    <div className={`mc-conv-list ${className}`}>
      <div className="mc-conv-list-header">
        <h2>Chats</h2>
        {showNewChat && onNewChat && (
          <button type="button" className="mc-icon-btn" onClick={onNewChat} title="New chat">
            ＋
          </button>
        )}
      </div>

      {showSearch && (
        <div className="mc-conv-list-search">
          <input
            type="search"
            placeholder="Search chats"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="mc-conv-list-items">
        {loading && filtered.length === 0 && (
          <div className="mc-empty">Loading conversations…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="mc-empty">No conversations yet</div>
        )}
        {filtered.map((conv) => {
          const peer = resolveUser(conv.peerId);
          const isActive = String(conv.id) === String(activeConversationId);
          const isSelfLast = String(conv.lastMessage?.senderId) === String(currentUserId);
          const presenceInfo = presence[conv.peerId] || conv.peerPresence;
          return (
            <button
              key={conv.id}
              type="button"
              className={`mc-conv-item ${isActive ? 'is-active' : ''} ${conv.isPinned ? 'is-pinned' : ''}`}
              onClick={() => onSelect?.(conv)}
            >
              <Avatar
                src={peer?.avatar}
                name={peer?.name}
                id={conv.peerId}
                online={presenceInfo?.online}
                size={44}
              />
              <div className="mc-conv-item-body">
                <div className="mc-conv-item-top">
                  <span className={`mc-conv-item-name ${!peer?.name ? 'is-loading' : ''}`}>
                    {peer?.name || 'Loading…'}
                  </span>
                  <span className="mc-conv-item-time">
                    {formatRelativeTime(conv.lastActivityAt)}
                  </span>
                </div>
                <div className="mc-conv-item-bottom">
                  <span className="mc-conv-item-preview">
                    {isSelfLast ? 'You: ' : ''}
                    {messagePreview(conv.lastMessage) || 'No messages yet'}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="mc-conv-item-badge">{conv.unreadCount}</span>
                  )}
                </div>
              </div>
              {conv.isMuted && <span className="mc-conv-item-mute" title="Muted">🔕</span>}
              {conv.isPinned && <span className="mc-conv-item-pin" title="Pinned">📌</span>}
            </button>
          );
        })}
        {hasMore && (
          <button type="button" className="mc-load-more" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
};
