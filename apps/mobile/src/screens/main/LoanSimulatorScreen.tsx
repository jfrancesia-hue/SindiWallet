import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

const TERM_OPTIONS = [3, 6, 9, 12, 18, 24];

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export default function LoanSimulatorScreen() {
  const [amount, setAmount] = useState(50000);
  const [termMonths, setTermMonths] = useState(12);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/loans/simulate', { amount, termMonths });
      setResult(data.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Error al simular');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Monto</Text>
      <Text style={styles.amountDisplay}>{formatCurrency(amount)}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>$1.000</Text>
        <Text style={styles.sliderLabel}>$500.000</Text>
      </View>

      <Text style={styles.sectionTitle}>Cuotas</Text>
      <View style={styles.chipRow}>
        {TERM_OPTIONS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, termMonths === t && styles.chipActive]}
            onPress={() => setTermMonths(t)}
          >
            <Text style={[styles.chipText, termMonths === t && styles.chipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSimulate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Simular</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cuota mensual</Text>
            <Text style={styles.resultValueBig}>{formatCurrency(result.monthlyPayment)}</Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>TNA</Text>
            <Text style={styles.resultValue}>{(result.tna * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total a devolver</Text>
            <Text style={styles.resultValue}>{formatCurrency(result.totalAmount)}</Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Score</Text>
            <View style={[styles.scoreBadge, { backgroundColor: result.scoring.approved ? colors.primary : colors.error }]}>
              <Text style={styles.scoreBadgeText}>
                {result.scoring.grade} — {result.scoring.score}pts
              </Text>
            </View>
          </View>
          {result.scoring.approved && (
            <TouchableOpacity style={styles.requestButton}>
              <Text style={styles.buttonText}>Solicitar Préstamo</Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  amountDisplay: {
    ...typography.balanceAmount,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultValueBig: {
    ...typography.sectionTitle,
    color: colors.primary,
    fontWeight: '700',
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.xs,
  },
  scoreBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scoreBadgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  requestButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
