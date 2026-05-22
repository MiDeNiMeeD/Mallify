import React, { useMemo } from 'react';
import { ChatProvider } from './';
import { useAuth } from '../context/AuthContext';

// Mounted high in the tree so the sidebar's unread badge can subscribe to it.
// When no user is signed in, ChatProvider sees a null currentUserId and stays
// idle (no socket, empty unread map).
const API_BASE_URL = 'http://localhost:4000';

export const AppChatProvider = ({ children }) => {
  const { user } = useAuth();
  const config = useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      getToken: () => localStorage.getItem('accessToken'),
      getCurrentUserId: () => user?._id || user?.id || null,
      getCurrentUserRole: () => user?.role || 'boutiques_manager',
    }),
    [user]
  );
  return <ChatProvider config={config}>{children}</ChatProvider>;
};
