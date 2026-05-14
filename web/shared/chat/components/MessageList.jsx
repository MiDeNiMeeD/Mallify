import React, { useEffect, useMemo, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Avatar } from './Avatar';
import { groupMessagesByDay, formatClockTime } from '../utils/format';

export const MessageList = ({
  messages,
  loadingOlder,
  hasMoreOlder,
  onLoadOlder,
  myUserId,
  peer,
  isPeerOnline,
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
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const lastCountRef = useRef(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    stickToBottomRef.current = distFromBottom < 80;
    if (el.scrollTop < 60 && hasMoreOlder && !loadingOlder) {
      onLoadOlder?.();
    }
  };

  useEffect(() => {
    if (stickToBottomRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: 'end' });
    } else if (messages.length > lastCountRef.current) {
      // scroll position is preserved by browser when prepending — but pin to a stable point
    }
    lastCountRef.current = messages.length;
  }, [messages.length]);

  const groups = groupMessagesByDay(messages);

  // Find the latest message I sent that the peer has read — that's where the
  // "Seen" marker goes (Messenger-style: floats with the latest read message).
  const lastSeenMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (String(m.senderId) !== String(myUserId)) continue;
      if (m.isDeletedForEveryone) continue;
      const peerRead = (m.readBy || []).some(
        (r) => String(r.userId) !== String(myUserId)
      );
      if (peerRead) return m._id;
    }
    return null;
  }, [messages, myUserId]);

  const seenAt = useMemo(() => {
    if (!lastSeenMessageId) return null;
    const msg = messages.find((m) => m._id === lastSeenMessageId);
    const myEntry = (msg?.readBy || []).find(
      (r) => String(r.userId) !== String(myUserId)
    );
    return myEntry?.readAt || null;
  }, [lastSeenMessageId, messages, myUserId]);

  return (
    <div className="mc-msg-list" ref={scrollRef} onScroll={onScroll}>
      {hasMoreOlder && (
        <div className="mc-load-older">
          {loadingOlder ? 'Loading…' : <button type="button" onClick={onLoadOlder}>Load older</button>}
        </div>
      )}
      {groups.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.id} className="mc-date-sep">
              <span>{item.label}</span>
            </div>
          );
        }
        const isSeenAnchor = item.message._id === lastSeenMessageId;
        return (
          <React.Fragment key={item.id}>
            <MessageBubble
              message={item.message}
              isMine={String(item.message.senderId) === String(myUserId)}
              myUserId={myUserId}
              peerName={peer?.name}
              peerAvatar={peer?.avatar}
              isPeerOnline={isPeerOnline}
              onReact={onReact}
              onUnreact={onUnreact}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onPin={onPin}
              onForward={onForward}
              onReport={onReport}
              resolveUser={resolveUser}
            />
            {isSeenAnchor && (
              <div className="mc-seen" title={seenAt ? `Seen ${formatClockTime(seenAt)}` : 'Seen'}>
                <Avatar
                  src={peer?.avatar}
                  name={peer?.name}
                  id={peer?.id}
                  size={16}
                />
                <span>Seen{seenAt ? ` ${formatClockTime(seenAt)}` : ''}</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
