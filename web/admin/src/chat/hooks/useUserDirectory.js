import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatProvider';

// In-memory cache shared across hook instances so multiple components don't
// re-fetch the same user. The cache survives only while the page is open.
const cache = new Map();
const inflight = new Map();

const requestBatched = async (client, ids) => {
  const fresh = ids.filter((id) => id && !cache.has(id) && !inflight.has(id));
  if (!fresh.length) return;
  let pending;
  pending = client
    .resolveUsers(fresh)
    .then(({ users = {} }) => {
      for (const id of fresh) {
        cache.set(id, users[id] || null);
        inflight.delete(id);
      }
      return users;
    })
    .catch(() => {
      for (const id of fresh) inflight.delete(id);
    });
  for (const id of fresh) inflight.set(id, pending);
  await pending;
};

export const useUserDirectory = (userIds) => {
  const { client } = useChat();
  const [, force] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const ids = Array.isArray(userIds) ? userIds : [];
  const key = ids.join(',');

  useEffect(() => {
    if (!ids.length) return;
    requestBatched(client, ids).then(() => {
      if (mountedRef.current) force((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, client]);

  const resolve = useCallback((id) => (id ? cache.get(id) || null : null), []);

  return { resolve };
};

// Helper: build a resolveUser function for ChatProvider config that auto-fetches.
export const buildResolveUser = (client) => {
  return (id) => {
    if (!id) return null;
    if (cache.has(id)) return cache.get(id);
    if (!inflight.has(id)) {
      const pending = client
        .resolveUsers([id])
        .then(({ users = {} }) => {
          cache.set(id, users[id] || null);
          inflight.delete(id);
          return users[id];
        })
        .catch(() => {
          inflight.delete(id);
        });
      inflight.set(id, pending);
    }
    return null;
  };
};
