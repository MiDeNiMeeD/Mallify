import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatProvider';
import { SOCKET_EVENTS } from '../client/socketClient';

export const useTyping = (conversationId) => {
  const { socket, config } = useChat();
  const [typingUsers, setTypingUsers] = useState([]);
  const lastSentRef = useRef(0);
  const stopTimerRef = useRef(null);
  const remoteTimersRef = useRef(new Map());

  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    const onStart = ({ conversationId: cid, userId }) => {
      if (String(cid) !== String(conversationId)) return;
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      const existing = remoteTimersRef.current.get(userId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== userId));
        remoteTimersRef.current.delete(userId);
      }, config.typingTimeoutMs);
      remoteTimersRef.current.set(userId, timer);
    };

    const onStop = ({ conversationId: cid, userId }) => {
      if (String(cid) !== String(conversationId)) return;
      setTypingUsers((prev) => prev.filter((u) => u !== userId));
      const existing = remoteTimersRef.current.get(userId);
      if (existing) {
        clearTimeout(existing);
        remoteTimersRef.current.delete(userId);
      }
    };

    socket.on(SOCKET_EVENTS.TYPING_START, onStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, onStop);

    return () => {
      socket.off(SOCKET_EVENTS.TYPING_START, onStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, onStop);
      setTypingUsers([]);
      remoteTimersRef.current.forEach((t) => clearTimeout(t));
      remoteTimersRef.current.clear();
    };
  }, [socket, conversationId, config.typingTimeoutMs]);

  const notifyTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    const now = Date.now();
    if (now - lastSentRef.current > 2500) {
      socket.emit('typing:start', { conversationId });
      lastSentRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId });
      lastSentRef.current = 0;
    }, 2500);
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    socket.emit('typing:stop', { conversationId });
    lastSentRef.current = 0;
  }, [socket, conversationId]);

  return { typingUsers, notifyTyping, stopTyping };
};
