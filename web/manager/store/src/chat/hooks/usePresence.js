import { useEffect, useState } from 'react';
import { useChat } from '../context/ChatProvider';
import { SOCKET_EVENTS } from '../client/socketClient';

export const usePresence = (userIds) => {
  const { client, socket } = useChat();
  const [presence, setPresence] = useState({});

  const idsKey = (userIds || []).join(',');

  useEffect(() => {
    const ids = (userIds || []).filter(Boolean);
    if (!ids.length) {
      setPresence({});
      return undefined;
    }
    let cancelled = false;
    client
      .getPresenceBatch(ids)
      .then((res) => {
        if (!cancelled) setPresence(res.presence || {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [idsKey, client]);

  useEffect(() => {
    if (!socket) return undefined;
    const ids = new Set((userIds || []).map(String));

    const onOnline = ({ userId }) => {
      if (!ids.has(String(userId))) return;
      setPresence((p) => ({ ...p, [userId]: { online: true, lastSeen: null } }));
    };
    const onOffline = ({ userId, lastSeen }) => {
      if (!ids.has(String(userId))) return;
      setPresence((p) => ({ ...p, [userId]: { online: false, lastSeen } }));
    };

    socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, onOnline);
    socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, onOffline);
    return () => {
      socket.off(SOCKET_EVENTS.PRESENCE_ONLINE, onOnline);
      socket.off(SOCKET_EVENTS.PRESENCE_OFFLINE, onOffline);
    };
  }, [socket, idsKey, userIds]);

  return presence;
};
