import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { groupMessagesByDay } from '../utils/format';

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

  return (
    <div className="mc-msg-list" ref={scrollRef} onScroll={onScroll}>
      {hasMoreOlder && (
        <div className="mc-load-older">
          {loadingOlder ? 'Loading…' : <button type="button" onClick={onLoadOlder}>Load older</button>}
        </div>
      )}
      {groups.map((item) =>
        item.type === 'date' ? (
          <div key={item.id} className="mc-date-sep">
            <span>{item.label}</span>
          </div>
        ) : (
          <MessageBubble
            key={item.id}
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
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
};
