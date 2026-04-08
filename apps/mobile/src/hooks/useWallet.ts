import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Wallet {
  id: string;
  balance: string;
  cvu: string | null;
  status: string;
  currency: string;
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get('/wallets/me');
      setWallet(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al obtener wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, isLoading, error, refetch: fetchWallet };
}
