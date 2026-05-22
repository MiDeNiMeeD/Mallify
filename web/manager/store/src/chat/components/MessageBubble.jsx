import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { Lightbox } from './Lightbox';
import { formatClockTime } from '../utils/format';
import { isImageMime, isVideoMime, isAudioMime } from '../utils/preview';
import { formatBytes } from '../utils/format';
import { resolveAttachmentUrl } from '../utils/attachmentUrl';
import { useChat } from '../context/ChatProvider';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageBubble = ({
  message,
  isMine,
  isPeerOnline,
  peerName,
  peerAvatar,
  myUserId,
  onReact,
  onUnreact,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onForward,
  onReport,
  resolveUser,
}) => {
  const { config } = useChat();
  const apiBaseUrl = config?.apiBaseUrl;
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content || '');

  const myReaction = (message.reactions || []).find((r) => String(r.userId) === String(myUserId));
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const isRead = isMine && (message.readBy || []).some((r) => String(r.userId) !== String(myUserId));
  const isDelivered =
    isMine &&
    (message.deliveredTo || []).some((r) => String(r.userId) !== String(myUserId));

  const ticks = message._failed
    ? '✕'
    : message._pending
    ? '⏱'
    : isRead
    ? '✓✓'
    : isDelivered
    ? '✓✓'
    : '✓';

  const handleReact = (emoji) => {
    setShowReactions(false);
    if (myReaction?.emoji === emoji) onUnreact?.(message._id);
    else onReact?.(message._id, emoji);
  };

  const submitEdit = () => {
    if (!draft.trim() || draft === message.content) {
      setEditing(false);
      return;
    }
    onEdit?.(message._id, draft);
    setEditing(false);
  };

  if (message.isDeletedForEveryone) {
    return (
      <div className={`mc-msg mc-msg-deleted ${isMine ? 'is-mine' : ''}`}>
        <span className="mc-msg-deleted-text">This message was deleted</span>
      </div>
    );
  }

  return (
    <div className={`mc-msg-row ${isMine ? 'is-mine' : ''}`}>
      {!isMine && (
        <Avatar src={peerAvatar} name={peerName} id={String(message.senderId)} size={28} />
      )}

      <div className="mc-msg-wrap">
        {message.replyTo && (
          <ReplyPreview replyToId={message.replyTo} resolveUser={resolveUser} />
        )}

        <div
          className={`mc-msg ${isMine ? 'is-mine' : ''} ${message.isPinned ? 'is-pinned' : ''}`}
          onDoubleClick={() => setShowReactions((v) => !v)}
        >
          {message.forwardedFrom && (
            <div className="mc-msg-forwarded">↪ Forwarded</div>
          )}

          {message.attachments?.length > 0 && (
            <Attachments attachments={message.attachments} apiBaseUrl={apiBaseUrl} />
          )}

          {editing ? (
            <div className="mc-msg-edit">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                autoFocus
              />
              <div className="mc-msg-edit-actions">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="button" onClick={submitEdit}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            message.content && <div className="mc-msg-text">{message.content}</div>
          )}

          <div className="mc-msg-meta">
            {message.isEdited && <span className="mc-msg-edited">edited</span>}
            <span className="mc-msg-time">{formatClockTime(message.createdAt)}</span>
            {isMine && <span className={`mc-msg-ticks ${isRead ? 'is-read' : ''}`}>{ticks}</span>}
          </div>

          <button
            type="button"
            className="mc-msg-menu-btn"
            onClick={() => setShowMenu((v) => !v)}
            title="Message options"
          >
            ⋯
          </button>

          {showMenu && (
            <div className="mc-msg-menu" onMouseLeave={() => setShowMenu(false)}>
              <button type="button" onClick={() => { setShowMenu(false); onReply?.(message); }}>
                Reply
              </button>
              <button type="button" onClick={() => { setShowMenu(false); setShowReactions(true); }}>
                React
              </button>
              <button type="button" onClick={() => { setShowMenu(false); onForward?.(message); }}>
                Forward
              </button>
              <button type="button" onClick={() => { setShowMenu(false); onPin?.(message); }}>
                {message.isPinned ? 'Unpin' : 'Pin'}
              </button>
              {isMine && message.messageType === 'text' && (
                <button type="button" onClick={() => { setShowMenu(false); setEditing(true); setDraft(message.content); }}>
                  Edit
                </button>
              )}
              <button type="button" onClick={() => { setShowMenu(false); onDelete?.(message, 'me'); }}>
                Delete for me
              </button>
              {isMine && (
                <button type="button" onClick={() => { setShowMenu(false); onDelete?.(message, 'everyone'); }}>
                  Delete for everyone
                </button>
              )}
              {!isMine && (
                <button type="button" onClick={() => { setShowMenu(false); onReport?.(message); }}>
                  Report
                </button>
              )}
            </div>
          )}

          {showReactions && (
            <div className="mc-reaction-picker" onMouseLeave={() => setShowReactions(false)}>
              {REACTION_EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  className={myReaction?.emoji === e ? 'is-active' : ''}
                  onClick={() => handleReact(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div className="mc-reactions">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                type="button"
                key={emoji}
                className={`mc-reaction ${myReaction?.emoji === emoji ? 'is-mine' : ''}`}
                onClick={() => handleReact(emoji)}
              >
                {emoji} {count > 1 ? count : ''}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyPreview = ({ replyToId, resolveUser }) => {
  return (
    <div className="mc-msg-reply">
      <span className="mc-msg-reply-bar" />
      <span className="mc-msg-reply-text">Reply</span>
    </div>
  );
};

const Attachments = ({ attachments, apiBaseUrl }) => {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="mc-msg-attachments">
      {attachments.map((a, i) => {
        const url = resolveAttachmentUrl(a.url, apiBaseUrl);
        if (isImageMime(a.mimeType)) {
          return (
            <button
              key={i}
              type="button"
              className="mc-att-image-wrap"
              onClick={() => setLightbox({ src: url, alt: a.name })}
            >
              <img src={url} alt={a.name} className="mc-att-image" />
            </button>
          );
        }
        if (isVideoMime(a.mimeType)) {
          return (
            <video key={i} src={url} controls className="mc-att-video" />
          );
        }
        if (isAudioMime(a.mimeType)) {
          return <audio key={i} src={url} controls className="mc-att-audio" />;
        }
        return (
          <a key={i} href={url} target="_blank" rel="noreferrer" className="mc-att-file">
            <span className="mc-att-icon">📎</span>
            <span className="mc-att-name">{a.name}</span>
            <span className="mc-att-size">{formatBytes(a.size)}</span>
          </a>
        );
      })}
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
};
