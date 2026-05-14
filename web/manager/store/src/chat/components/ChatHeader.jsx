import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { formatLastSeen } from '../utils/format';

export const ChatHeader = ({
  peer,
  presence,
  onBack,
  onTogglePin,
  onToggleArchive,
  onToggleMute,
  onClearHistory,
  onDeleteConversation,
  onBlock,
  onReport,
  isPinned,
  isArchived,
  isMuted,
}) => {
  const [menu, setMenu] = useState(false);
  const subtitle = presence?.online ? 'online' : formatLastSeen(presence?.lastSeen);

  return (
    <div className="mc-thread-header">
      {onBack && (
        <button type="button" className="mc-icon-btn mc-back" onClick={onBack} title="Back">
          ←
        </button>
      )}
      <Avatar src={peer?.avatar} name={peer?.name} id={peer?.id} online={presence?.online} size={40} />
      <div className="mc-thread-header-info">
        <div className={`mc-thread-header-name ${!peer?.name ? 'is-loading' : ''}`}>
          {peer?.name || 'Loading…'}
        </div>
        <div className="mc-thread-header-sub">{subtitle}</div>
      </div>
      <div className="mc-thread-header-actions">
        <button type="button" className="mc-icon-btn" onClick={() => setMenu((v) => !v)}>
          ⋮
        </button>
        {menu && (
          <div className="mc-thread-menu" onMouseLeave={() => setMenu(false)}>
            <button type="button" onClick={() => { setMenu(false); onTogglePin?.(); }}>
              {isPinned ? 'Unpin chat' : 'Pin chat'}
            </button>
            <button type="button" onClick={() => { setMenu(false); onToggleMute?.(); }}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button type="button" onClick={() => { setMenu(false); onToggleArchive?.(); }}>
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button type="button" onClick={() => { setMenu(false); onClearHistory?.(); }}>
              Clear history
            </button>
            <button type="button" onClick={() => { setMenu(false); onBlock?.(); }}>
              Block user
            </button>
            <button type="button" onClick={() => { setMenu(false); onReport?.(); }}>
              Report
            </button>
            <button type="button" className="mc-danger" onClick={() => { setMenu(false); onDeleteConversation?.(); }}>
              Delete chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
