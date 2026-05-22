import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_CONFIG } from '../client/config';
import { ChatClient } from '../client/chatClient';
import { createSocket } from '../client/socketClient';

const ChatContext = createContext(null);

export const ChatProvider = ({ config: userConfig = {}, children }) => {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);
  const client = useMemo(() => new ChatClient(config), [config]);

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Aggregated unread count for the sidebar/topbar badge. Map id -> count so
  // we can drop entries to zero independently when a conversation is read.
  const [unreadByConv, setUnreadByConv] = useState({});
  const totalUnread = Object.values(unreadByConv).reduce((s, v) => s + v, 0);

  // user directory cache (lazy fetch on demand, bumps version to trigger re-renders).
  // fetchUser calls within the same tick are coalesced into a single batch request.
  const cacheRef = useRef(new Map());
  const inflightRef = useRef(new Map());
  const queueRef = useRef([]);
  const queueTimerRef = useRef(null);
  const [cacheVersion, setCacheVersion] = useState(0);
  const bump = useCallback(() => setCacheVersion((v) => v + 1), []);

  const flushQueue = useCallback(async () => {
    const ids = queueRef.current;
    queueRef.current = [];
    queueTimerRef.current = null;
    if (!ids.length) return;
    try {
      const { users = {} } = await client.resolveUsers(ids);
      for (const id of ids) {
        cacheRef.current.set(id, users[id] || null);
        inflightRef.current.delete(id);
      }
      bump();
    } catch {
      for (const id of ids) inflightRef.current.delete(id);
    }
  }, [client, bump]);

  const fetchUser = useCallback(
    (id) => {
      if (!id || cacheRef.current.has(id) || inflightRef.current.has(id)) return;
      inflightRef.current.set(id, true);
      queueRef.current.push(id);
      if (!queueTimerRef.current) {
        queueTimerRef.current = setTimeout(flushQueue, 0);
      }
    },
    [flushQueue]
  );

  const resolveUser = useCallback(
    (id) => {
      if (!id) return null;
      const fromConfig = config.resolveUser?.(id);
      if (fromConfig) return fromConfig;
      if (cacheRef.current.has(id)) return cacheRef.current.get(id);
      fetchUser(id);
      return null;
    },
    [config, fetchUser]
  );

  const currentUserId = config.getCurrentUserId?.() || null;
  const currentUserRole = config.getCurrentUserRole?.() || null;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let s = null;

    if (!currentUserId) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    (async () => {
      try {
        s = await createSocket(config);
        if (cancelled) {
          s.disconnect();
          return;
        }
        s.on('connect', () => mountedRef.current && setConnected(true));
        s.on('disconnect', () => mountedRef.current && setConnected(false));
        s.on('connect_error', (err) => {
          if (!mountedRef.current) return;
          setError(err);
          setConnected(false);
        });
        setSocket(s);
      } catch (err) {
        if (mountedRef.current) setError(err);
      }
    })();

    return () => {
      cancelled = true;
      if (s) s.disconnect();
    };
  }, [config, currentUserId]);

  // Refetch the authoritative unread map from the server. Used as a recovery
  // path on reconnect / window focus where socket events may have been missed.
  const refreshUnread = useCallback(async () => {
    if (!currentUserId) {
      setUnreadByConv({});
      return;
    }
    try {
      const data = await client.listConversations({ limit: 100 });
      const map = {};
      for (const c of data?.conversations || []) {
        map[c.id] = c.unreadCount || 0;
      }
      if (mountedRef.current) setUnreadByConv(map);
    } catch {
      // Keep existing map on failure — better stale than zeroed.
    }
  }, [client, currentUserId]);

  // Seed unread counts when the user logs in, then keep them in sync via sockets.
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // Resync when the tab regains visibility — events delivered while hidden
  // may have been throttled by the browser.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshUnread();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refreshUnread]);

  // Socket-driven unread updates. CONVERSATION_UPDATED is the primary signal;
  // MESSAGE_NEW is a deduped backup so the badge survives any single event drop.
  useEffect(() => {
    if (!socket) return undefined;

    const onUpdated = (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      const isFromMe = String(payload.lastMessage?.senderId) === String(currentUserId);
      if (isFromMe) return;
      setUnreadByConv((prev) => ({ ...prev, [cid]: (prev[cid] || 0) + 1 }));
    };

    const seenMessageIds = new Set();
    const onMessageNew = (payload) => {
      const msg = payload?.message;
      const cid = msg?.conversationId;
      const mid = msg?._id;
      if (!cid || !mid) return;
      if (String(msg.senderId) === String(currentUserId)) return;
      if (seenMessageIds.has(String(mid))) return;
      seenMessageIds.add(String(mid));
      if (seenMessageIds.size > 200) {
        const first = seenMessageIds.values().next().value;
        if (first) seenMessageIds.delete(first);
      }
      setUnreadByConv((prev) => ({ ...prev, [cid]: (prev[cid] || 0) + 1 }));
    };

    const onRead = (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      if (String(payload?.readerId) !== String(currentUserId)) return;
      setUnreadByConv((prev) => (prev[cid] ? { ...prev, [cid]: 0 } : prev));
    };

    const onNew = (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;
      setUnreadByConv((prev) => (cid in prev ? prev : { ...prev, [cid]: 0 }));
    };

    const onConnect = () => {
      refreshUnread();
    };

    socket.on('conversation:updated', onUpdated);
    socket.on('message:new', onMessageNew);
    socket.on('message:read', onRead);
    socket.on('conversation:new', onNew);
    socket.on('connect', onConnect);
    return () => {
      socket.off('conversation:updated', onUpdated);
      socket.off('message:new', onMessageNew);
      socket.off('message:read', onRead);
      socket.off('conversation:new', onNew);
      socket.off('connect', onConnect);
    };
  }, [socket, currentUserId, refreshUnread]);

  // Drop unread locally first (so the badge updates instantly), then sync the
  // server. Used by ChatThread when a conversation is opened.
  const markConversationRead = useCallback(
    async (conversationId) => {
      setUnreadByConv((prev) =>
        prev[conversationId] ? { ...prev, [conversationId]: 0 } : prev
      );
      try {
        await client.markRead(conversationId);
      } catch {
        // server will re-emit on next conversation:updated if anything went wrong
      }
    },
    [client]
  );

  const value = useMemo(
    () => ({
      config,
      client,
      socket,
      connected,
      error,
      currentUserId,
      currentUserRole,
      resolveUser,
      totalUnread,
      refreshUnread,
      markConversationRead,
    }),
    // cacheVersion is included so context consumers re-render when the user
    // directory cache fills (resolveUser is stable but its result changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config,
      client,
      socket,
      connected,
      error,
      currentUserId,
      currentUserRole,
      resolveUser,
      totalUnread,
      refreshUnread,
      markConversationRead,
      cacheVersion,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
};

export const useResolvedUser = (id) => {
  const { resolveUser } = useChat();
  return resolveUser(id);
};
