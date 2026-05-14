import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatProvider';
import { SOCKET_EVENTS } from '../client/socketClient';

const sortByCreatedAt = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

export const useMessages = (conversationId) => {
  const { client, socket, currentUserId } = useChat();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [olderCursor, setOlderCursor] = useState(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const load = useCallback(
    async ({ reset = false, before } = {}) => {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await client.listMessages(conversationId, { before, limit: 40 });
        if (reset) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m._id));
            const merged = [...data.messages.filter((m) => !ids.has(m._id)), ...prev];
            return merged.sort(sortByCreatedAt);
          });
        }
        setHasMore(data.hasMore);
        setOlderCursor(data.nextCursor);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [client, conversationId]
  );

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setOlderCursor(null);
    setHasMore(false);
    load({ reset: true });
  }, [conversationId, load]);

  const loadOlder = useCallback(() => {
    if (!hasMore || loading || !olderCursor) return;
    load({ before: olderCursor });
  }, [hasMore, loading, olderCursor, load]);

  // Socket subscriptions for this conversation
  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    socket.emit('conversation:join', conversationId);

    const sameConv = (cid) => String(cid) === String(conversationIdRef.current);

    const onNew = ({ message }) => {
      if (!message || !sameConv(message.conversationId)) return;
      setMessages((prev) => {
        if (message.clientMessageId) {
          const idx = prev.findIndex(
            (m) =>
              m.clientMessageId === message.clientMessageId &&
              String(m.senderId) === String(message.senderId)
          );
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = message;
            return next;
          }
        }
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const onEdited = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? { ...m, content: payload.content, isEdited: true, updatedAt: payload.updatedAt }
            : m
        )
      );
    };

    const onDeleted = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      if (payload.scope === 'everyone') {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === payload.messageId
              ? { ...m, isDeletedForEveryone: true, content: '', attachments: [] }
              : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== payload.messageId));
      }
    };

    const onReaction = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== payload.messageId) return m;
          const reactions = (m.reactions || []).filter((r) => String(r.userId) !== String(payload.userId));
          if (payload.action === 'add') {
            reactions.push({ userId: payload.userId, emoji: payload.emoji, reactedAt: new Date().toISOString() });
          }
          return { ...m, reactions };
        })
      );
    };

    const onRead = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (!payload.messageIds?.includes(m._id)) return m;
          const readBy = (m.readBy || []).filter((r) => String(r.userId) !== String(payload.readerId));
          readBy.push({ userId: payload.readerId, readAt: payload.readAt });
          return { ...m, readBy };
        })
      );
    };

    const onDelivered = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (!payload.messageIds?.includes(m._id)) return m;
          const deliveredTo = (m.deliveredTo || []).filter(
            (r) => String(r.userId) !== String(payload.receiverId)
          );
          deliveredTo.push({ userId: payload.receiverId, deliveredAt: payload.deliveredAt });
          return { ...m, deliveredTo };
        })
      );
    };

    const onPinned = (payload) => {
      if (!sameConv(payload.conversationId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? { ...m, isPinned: payload.isPinned, pinnedBy: payload.pinnedBy }
            : m
        )
      );
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onNew);
    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, onEdited);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
    socket.on(SOCKET_EVENTS.MESSAGE_REACTION, onReaction);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, onRead);
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, onDelivered);
    socket.on(SOCKET_EVENTS.MESSAGE_PINNED, onPinned);

    return () => {
      socket.emit('conversation:leave', conversationId);
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onNew);
      socket.off(SOCKET_EVENTS.MESSAGE_EDITED, onEdited);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
      socket.off(SOCKET_EVENTS.MESSAGE_REACTION, onReaction);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, onRead);
      socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, onDelivered);
      socket.off(SOCKET_EVENTS.MESSAGE_PINNED, onPinned);
    };
  }, [socket, conversationId]);

  // Auto-mark incoming as delivered
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    const unseen = messages
      .filter(
        (m) =>
          String(m.receiverId) === String(currentUserId) &&
          !(m.deliveredTo || []).some((d) => String(d.userId) === String(currentUserId))
      )
      .map((m) => m._id);
    if (unseen.length) {
      client.markDelivered(unseen).catch(() => {});
    }
  }, [messages, conversationId, currentUserId, client]);

  // Sending helpers (optimistic insert) ────────────────────────────────────
  const sendText = useCallback(
    async (text, { receiverId, replyTo } = {}) => {
      if (!text?.trim()) return null;
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimistic = {
        _id: `temp-${clientMessageId}`,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        receiverId,
        messageType: 'text',
        content: text,
        attachments: [],
        replyTo: replyTo || null,
        reactions: [],
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }],
        deliveredTo: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      try {
        const res = await client.sendMessage({
          conversationId,
          receiverId,
          messageType: 'text',
          content: text,
          replyTo: replyTo || null,
          clientMessageId,
        });
        const real = res.message || res;
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMessageId ? real : m))
        );
        return real;
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, _failed: true, _pending: false } : m
          )
        );
        throw err;
      }
    },
    [client, conversationId, currentUserId]
  );

  const sendAttachment = useCallback(
    async (files, { receiverId, caption = '', replyTo } = {}) => {
      if (!files?.length) return null;
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimistic = {
        _id: `temp-${clientMessageId}`,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        receiverId,
        messageType: 'file',
        content: caption,
        attachments: [],
        replyTo: replyTo || null,
        reactions: [],
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }],
        deliveredTo: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      try {
        const uploadRes = await client.uploadAttachments(files);
        const atts = uploadRes.attachments || [];
        const firstType = atts[0]?.suggestedType || 'file';
        const res = await client.sendMessage({
          conversationId,
          receiverId,
          messageType: firstType,
          content: caption,
          attachments: atts,
          replyTo: replyTo || null,
          clientMessageId,
        });
        const real = res.message || res;
        setMessages((prev) => {
          // If the socket already inserted the real message, drop the optimistic one.
          if (prev.some((m) => m._id === real._id)) {
            return prev.filter((m) => m.clientMessageId !== clientMessageId || m._id === real._id);
          }
          return prev.map((m) => (m.clientMessageId === clientMessageId ? real : m));
        });
        return real;
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, _failed: true, _pending: false } : m
          )
        );
        throw err;
      }
    },
    [client, conversationId, currentUserId]
  );

  const editMessage = useCallback(
    async (messageId, newContent) => {
      const res = await client.editMessage(messageId, newContent);
      const updated = res.message || res;
      setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));
      return updated;
    },
    [client]
  );

  const deleteMessage = useCallback(
    async (messageId, scope = 'me') => {
      await client.deleteMessage(messageId, scope);
      if (scope === 'everyone') {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeletedForEveryone: true, content: '', attachments: [] } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    },
    [client]
  );

  const react = useCallback(
    async (messageId, emoji) => {
      const res = await client.reactToMessage(messageId, emoji);
      const updated = res.message || res;
      setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));
    },
    [client]
  );

  const unreact = useCallback(
    async (messageId) => {
      const res = await client.removeReaction(messageId);
      const updated = res.message || res;
      setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));
    },
    [client]
  );

  return {
    messages,
    loading,
    error,
    hasMore,
    loadOlder,
    sendText,
    sendAttachment,
    editMessage,
    deleteMessage,
    react,
    unreact,
  };
};
