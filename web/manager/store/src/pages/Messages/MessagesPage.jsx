import React, { useMemo } from 'react';
import { ChatProvider, ChatLayout } from '../../chat';
import '../../chat/styles/chat.css';
import { useAuth } from '../../context/AuthContext';
import './MessagesPage.css';

const API_BASE_URL = 'http://localhost:4000';

const MessagesPage = () => {
  const { user } = useAuth();

  const chatConfig = useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      getToken: () => localStorage.getItem('accessToken'),
      getCurrentUserId: () => user?._id || user?.id || null,
      getCurrentUserRole: () => user?.role || 'boutiques_manager',
    }),
    [user]
  );

  if (!user) {
    return <div style={{ padding: 24 }}>Please sign in to use chat.</div>;
  }

  return (
    <div className="mc-root mgr-messages-page">
      <ChatProvider config={chatConfig}>
        <ChatLayout />
      </ChatProvider>
    </div>
  );
};

export default MessagesPage;
