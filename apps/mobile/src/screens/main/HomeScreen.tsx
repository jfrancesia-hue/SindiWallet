import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;

const quickActions = [
  { label: 'Transferir', icon: '↗', screen: 'Transfer' as const },
  { label: 'Cobrar', icon: '↙', screen: 'QrGenerate' as const },
  { label: 'Pagar QR', icon: '⊞', screen: 'QrPay' as const },
  { label: 'Más', icon: '⋯', screen: 'Benefits' as const },
];

const shortcuts = [
  { label: 'Servicios', icon: '⚡' },
  { label: 'Recargas', icon: '📱' },
  { label: 'Beneficios', icon: '🎁' },
  { label: 'Sindicato', icon: '🏛' },
];

function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export default function HomeScreen({ navigation }: Props) {
  const { wallet, isLoading: walletLoading, refetch: refetchWallet } = useWallet();
  const { transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions(5);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), refetchTx()]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceAmount}>
          {wallet ? formatCurrency(wallet.balance) : '$0,00'}
        </Text>
        {wallet?.cvu && (
          <Text style={styles.cvuText}>CVU: {wallet.cvu}</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickActionItem}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>{action.icon}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cuotas Card */}
      <TouchableOpacity
        style={styles.duesCard}
        onPress={() => navigation.navigate('DuesHistory')}
      >
        <View style={styles.duesLeft}>
          <View style={styles.duesProgress}>
            <Text style={styles.duesProgressText}>9/12</Text>
          </View>
        </View>
        <View style={styles.duesRight}>
          <Text style={styles.duesTitle}>Cuotas Sindicales</Text>
          <Text style={styles.duesSubtitle}>Próximo vencimiento: 10/05</Text>
          <Text style={styles.duesAmount}>Aporte Sindical</Text>
        </View>
      </TouchableOpacity>

      {/* Accesos Rápidos */}
      <View style={styles.shortcutsRow}>
        {shortcuts.map((s) => (
          <TouchableOpacity key={s.label} style={styles.shortcutItem}>
            <View style={styles.shortcutIcon}>
              <Text style={styles.shortcutIconText}>{s.icon}</Text>
            </View>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transacciones Recientes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movimientos recientes</Text>
      </View>

      {transactions.length === 0 && !txLoading && (
        <Text style={styles.emptyText}>Sin movimientos aún</Text>
      )}

      {transactions.map((tx) => (
        <View key={tx.id} style={styles.txItem}>
          <View style={styles.txIcon}>
            <Text style={styles.txIconText}>
              {tx.type.includes('PAYMENT') ? '🛒' : tx.type.includes('TRANSFER') ? '↔' : '💰'}
            </Text>
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txDescription} numberOfLines={1}>
              {tx.description ?? tx.type.replace(/_/g, ' ')}
            </Text>
            <Text style={styles.txDate}>
              {new Date(tx.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </View>
          <Text
            style={[
              styles.txAmount,
              tx.receiver ? styles.txAmountPositive : styles.txAmountNegative,
            ]}
          >
            {tx.receiver ? '+' : '-'}{formatCurrency(tx.amount)}
          </Text>
        </View>
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.cardHighlightStart,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.balanceAmount,
    color: colors.textPrimary,
  },
  cvuText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionIconText: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  quickActionLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  duesCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  duesLeft: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  duesProgress: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duesProgressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  duesRight: {
    flex: 1,
  },
  duesTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  duesSubtitle: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
  },
  duesAmount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  shortcutItem: {
    alignItems: 'center',
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shortcutIconText: {
    fontSize: 20,
  },
  shortcutLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  txIconText: {
    fontSize: 18,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  txDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    ...typography.body,
    fontWeight: '600',
  },
  txAmountPositive: {
    color: colors.success,
  },
  txAmountNegative: {
    color: colors.textPrimary,
  },
});
