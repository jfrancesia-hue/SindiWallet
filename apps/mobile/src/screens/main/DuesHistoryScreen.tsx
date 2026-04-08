import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export default function DuesHistoryScreen() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [selectedYear]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: res } = await api.get(`/dues/my/history?year=${selectedYear}`);
      setData(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const monthName = (period: string) => {
    const month = parseInt(period.split('-')[1], 10);
    const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return names[month - 1] ?? period;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Year tabs */}
      <View style={styles.yearTabs}>
        {YEARS.map((year) => (
          <TouchableOpacity
            key={year}
            style={[styles.yearTab, selectedYear === year && styles.yearTabActive]}
            onPress={() => setSelectedYear(year)}
          >
            <Text style={[styles.yearTabText, selectedYear === year && styles.yearTabTextActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : data ? (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total contribuido</Text>
            <Text style={styles.summaryAmount}>
              ${data.totalPaid?.toLocaleString('es-AR') ?? '0'}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${data.totalMonths > 0 ? (data.paidCount / data.totalMonths) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data.paidCount}/{data.totalMonths} cuotas
            </Text>
          </View>

          {/* Monthly grid */}
          {data.history?.map((due: any) => (
            <View key={due.dueId}>
              <Text style={styles.dueName}>{due.dueName}</Text>
              <View style={styles.monthGrid}>
                {due.months?.map((m: any) => (
                  <View key={m.period} style={styles.monthCell}>
                    <Text style={styles.monthLabel}>{monthName(m.period)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        m.status === 'PAID' ? styles.badgePaid : styles.badgePending,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {m.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.emptyText}>Sin datos para este año</Text>
      )}

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
  yearTabs: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  yearTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  yearTabActive: {
    backgroundColor: colors.primary,
  },
  yearTabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  yearTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryAmount: {
    ...typography.balanceAmount,
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dueName: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  monthCell: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgePaid: {
    backgroundColor: colors.primary,
  },
  badgePending: {
    backgroundColor: colors.accent,
  },
  statusText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 10,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
