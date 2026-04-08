import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSocket } from './useSocket';

export function useRealtimeNotifications() {
  const { on } = useSocket();
  const [lastNotification, setLastNotification] = useState<{
    id: string;
    title: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    const off = on('notification:new', (data) => {
      setLastNotification(data);
      Alert.alert(data.title, data.body);
    });

    return off;
  }, [on]);

  return { lastNotification };
}

export function useWalletUpdates(onUpdate: () => void) {
  const { on } = useSocket();

  useEffect(() => {
    const off = on('wallet:update', () => {
      onUpdate();
    });

    return off;
  }, [on, onUpdate]);
}
