import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

const FILTERS = ['Todas', 'Movimientos', 'Cuotas', 'Sindicato'];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todas');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/notifications/my');
      setNotifications(data.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // silent
    }
  };

  const grouped = notifications.reduce<Record<string, any[]>>((acc, n) => {
    const date = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) label = 'Hoy';
    else if (date.toDateString() === yesterday.toDateString()) label = 'Ayer';
    else label = date.toLocaleDateString('es-AR');

    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  const sections = Object.entries(grouped);

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === item && styles.filterTabActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterRow}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([label]) => label}
          renderItem={({ item: [label, items] }) => (
            <View>
              <Text style={styles.dateLabel}>{label}</Text>
              {items.map((n: any) => (
                <TouchableOpacity
                  key={n.id}
                  style={styles.notifItem}
                  onPress={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <View style={[styles.notifDot, n.isRead && styles.notifDotRead]} />
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {n.body}
                    </Text>
                  </View>
                  <Text style={styles.notifTime}>
                    {new Date(n.createdAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Sin notificaciones</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  notifDotRead: {
    backgroundColor: 'transparent',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notifBody: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notifTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
