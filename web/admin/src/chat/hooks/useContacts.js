import { useCallback, useEffect, useState } from 'react';
import { useChat } from '../context/ChatProvider';

export const useContacts = ({ q = '', role = '' } = {}) => {
  const { client, currentUserId } = useChat();
  const [data, setData] = useState({
    mode: 'search',
    users: [],
    buckets: null,
    meta: null,
    debug: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNow = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await client.getContacts({ q, role });
      setData({
        mode: res.mode || 'search',
        users: res.users || [],
        buckets: res.buckets || null,
        meta: res.meta || null,
        debug: res.debug || null,
      });
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, q, role, currentUserId]);

  useEffect(() => {
    const t = setTimeout(fetchNow, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [fetchNow, q]);

  return { ...data, loading, error, refresh: fetchNow };
};
