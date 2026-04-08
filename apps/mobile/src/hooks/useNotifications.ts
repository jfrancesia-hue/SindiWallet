import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/my/unread-count');
      setCount(data.data.unread);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { count, refetch: fetch };
}
