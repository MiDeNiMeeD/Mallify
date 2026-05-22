import React from 'react';
import { ChatLayout } from '../../chat';
import '../../chat/styles/chat.css';
import { useAuth } from '../../context/AuthContext';
import './MessagesPage.css';

// ChatProvider is mounted at the app root (AppChatProvider) so the sidebar
// unread badge can subscribe to it. This page just renders the chat UI.
const MessagesPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ padding: 24 }}>Please sign in to use chat.</div>;
  }

  return (
    <div className="mc-root admin-messages-page">
      <ChatLayout />
    </div>
  );
};

export default MessagesPage;
