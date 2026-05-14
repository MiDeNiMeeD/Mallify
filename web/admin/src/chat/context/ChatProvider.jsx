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
    }),
    // cacheVersion is included so context consumers re-render when the user
    // directory cache fills (resolveUser is stable but its result changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, client, socket, connected, error, currentUserId, currentUserRole, resolveUser, cacheVersion]
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
