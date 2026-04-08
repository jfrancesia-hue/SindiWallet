import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  description: string | null;
  createdAt: string;
  sender?: { firstName: string; lastName: string };
  receiver?: { firstName: string; lastName: string };
}

export function useTransactions(limit = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/transactions?limit=${limit}`);
      setTransactions(data.data.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { transactions, isLoading, refetch: fetch };
}
