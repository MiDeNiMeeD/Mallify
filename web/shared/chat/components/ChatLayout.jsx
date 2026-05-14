import React, { useEffect, useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatThread } from './ChatThread';
import { NewChatPicker } from './NewChatPicker';
import { useChat } from '../context/ChatProvider';

export const ChatLayout = ({ initialPeerId, className = '' }) => {
  const { client } = useChat();
  const [active, setActive] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!initialPeerId) return;
    let cancelled = false;
    client
      .openOrCreateConversation(initialPeerId)
      .then((res) => {
        if (cancelled) return;
        setActive(res.conversation);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialPeerId, client]);

  const openByUser = async (user) => {
    if (!user?.id) return;
    try {
      const res = await client.openOrCreateConversation(user.id);
      setActive(res.conversation);
      setPickerOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(`Could not start chat: ${e.message}`);
    }
  };

  const onConversationChanged = (closed) => {
    setRefreshKey((k) => k + 1);
    if (closed) setActive(null);
  };

  return (
    <div className={`mc-layout ${active ? 'has-active' : ''} ${className}`}>
      <aside className="mc-layout-sidebar" key={refreshKey}>
        <ConversationList
          activeConversationId={active?.id}
          onSelect={(conv) => setActive(conv)}
          onNewChat={() => setPickerOpen(true)}
        />
      </aside>
      <main className="mc-layout-main">
        <ChatThread
          conversation={active}
          onBack={() => setActive(null)}
          onConversationChanged={onConversationChanged}
        />
      </main>
      {pickerOpen && (
        <NewChatPicker
          onPick={openByUser}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};
