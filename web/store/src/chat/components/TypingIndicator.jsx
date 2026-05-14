import React from 'react';

export const TypingIndicator = ({ typingUsers = [], resolveName }) => {
  if (!typingUsers.length) return null;
  const label =
    typingUsers.length === 1
      ? `${resolveName?.(typingUsers[0]) || 'Someone'} is typing`
      : `${typingUsers.length} people are typing`;
  return (
    <div className="mc-typing">
      <span className="mc-typing-dots">
        <i /><i /><i />
      </span>
      <span className="mc-typing-label">{label}</span>
    </div>
  );
};
