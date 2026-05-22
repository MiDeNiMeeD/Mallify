import React from 'react';
import { ChatLayout } from '../../chat';
import '../../chat/styles/chat.css';
import { useAuth } from '../../context/AuthContext';
import './CustomerMessages.css';

// ChatProvider is mounted at the app root (AppChatProvider) so the sidebar
// unread badge can subscribe to it. This page just renders the chat UI.
function CustomerMessages() {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ padding: 24 }}>Please sign in to use chat.</div>;
  }

  return (
    <div className="mc-root store-messages-page">
      <ChatLayout />
    </div>
  );
}

export default CustomerMessages;
