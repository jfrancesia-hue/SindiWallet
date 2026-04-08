import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3000';

interface SocketEvents {
  'notification:new': (data: { id: string; title: string; body: string; channel: string }) => void;
  'wallet:update': (data: { event: string; transactionId: string }) => void;
  'transaction:update': (data: { id: string; type: string; status: string; amount: string }) => void;
  'loan:update': (data: { id: string; status: string; event: string }) => void;
  'benefit:update': (data: { id: string; status: string; benefitName: string }) => void;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const connect = async () => {
      const orgId = await SecureStore.getItemAsync('org_id');

      socketRef.current = io(`${API_BASE}/ws`, {
        auth: {
          userId: user?.id,
          orgId,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionAttempts: 10,
      });

      socketRef.current.on('connect', () => {
        console.log('[WS] Connected');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log(`[WS] Disconnected: ${reason}`);
      });
    };

    connect();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K],
  ) => {
    socketRef.current?.on(event, handler as any);
    return () => {
      socketRef.current?.off(event, handler as any);
    };
  }, []);

  return { on, socket: socketRef };
}
