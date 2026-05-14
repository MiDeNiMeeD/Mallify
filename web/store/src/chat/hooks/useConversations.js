import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatProvider';
import { SOCKET_EVENTS } from '../client/socketClient';

export const useConversations = ({ archived = false } = {}) => {
  const { client, socket, currentUserId } = useChat();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef(null);

  const fetchPage = useCallback(
    async ({ reset = false } = {}) => {
      setLoading(true);
      try {
        const data = await client.listConversations({
          archived,
          cursor: reset ? undefined : cursorRef.current || undefined,
        });
        setConversations((prev) => (reset ? data.conversations : [...prev, ...data.conversations]));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
        cursorRef.current = data.nextCursor;
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [client, archived]
  );

  useEffect(() => {
    cursorRef.current = null;
    fetchPage({ reset: true });
  }, [fetchPage]);

  const upsertById = useCallback((conv) => {
    if (!conv?.id && !conv?._id) return;
    const id = conv.id || conv._id;
    setConversations((prev) => {
      const idx = prev.findIndex((c) => (c.id || c._id) === id);
      if (idx === -1) return [{ ...conv, id }, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], ...conv, id };
      return next.sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));
    });
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const onUpdated = (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      const isFromMe = String(payload.lastMessage?.senderId) === String(currentUserId);
      setConversations((prev) => {
        const idx = prev.findIndex((c) => (c.id || c._id) === cid);
        if (idx === -1) {
          // Conversation not in list yet — fetch it once (e.g. a brand-new chat from the peer's side).
          client.getConversation(cid).then((data) => upsertById(data.conversation)).catch(() => {});
          return prev;
        }
        const current = prev[idx];
        const next = [...prev];
        next[idx] = {
          ...current,
          lastMessage: payload.lastMessage || current.lastMessage,
          lastActivityAt: payload.lastMessage?.createdAt || current.lastActivityAt,
          unreadCount: isFromMe ? current.unreadCount : (current.unreadCount || 0) + 1,
        };
        return next.sort(
          (a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0)
        );
      });
    };

    const onNew = async (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      try {
        const data = await client.getConversation(cid);
        upsertById(data.conversation);
      } catch {
        // ignore
      }
    };

    const onRead = (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      // When the current user reads, zero their unread count in the list.
      if (String(payload.readerId) !== String(currentUserId)) return;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => (c.id || c._id) === cid);
        if (idx === -1) return prev;
        if (!prev[idx].unreadCount) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], unreadCount: 0, lastReadAt: payload.readAt };
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, onUpdated);
    socket.on(SOCKET_EVENTS.CONVERSATION_NEW, onNew);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, onRead);

    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, onUpdated);
      socket.off(SOCKET_EVENTS.CONVERSATION_NEW, onNew);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, onRead);
    };
  }, [socket, client, currentUserId, upsertById]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchPage({ reset: false });
  }, [hasMore, loading, fetchPage]);

  const refresh = useCallback(() => {
    cursorRef.current = null;
    return fetchPage({ reset: true });
  }, [fetchPage]);

  return { conversations, loading, error, hasMore, loadMore, refresh, upsertById };
};
