import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

export default function CardsScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Virtual Card */}
      <View style={styles.card}>
        <View style={styles.cardChip}>
          <Text style={styles.chipText}>SW</Text>
        </View>
        <Text style={styles.cardNumber}>•••• •••• •••• 4527</Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Titular</Text>
            <Text style={styles.cardValue}>MARÍA LÓPEZ</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Vencimiento</Text>
            <Text style={styles.cardValue}>12/28</Text>
          </View>
        </View>
        <Text style={styles.cardBrand}>SindiWallet Virtual</Text>
      </View>

      <Text style={styles.sectionTitle}>Acciones</Text>

      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionIcon}>🔒</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Bloquear tarjeta</Text>
          <Text style={styles.actionSub}>Bloqueá temporalmente tu tarjeta virtual</Text>
        </View>
        <Text style={styles.actionChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionIcon}>📋</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Ver datos completos</Text>
          <Text style={styles.actionSub}>Número, CVV y vencimiento</Text>
        </View>
        <Text style={styles.actionChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionIcon}>⚙</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Límites</Text>
          <Text style={styles.actionSub}>Configurá tus límites de compra</Text>
        </View>
        <Text style={styles.actionChevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonIcon}>💳</Text>
        <Text style={styles.comingSoonTitle}>Tarjeta física próximamente</Text>
        <Text style={styles.comingSoonSub}>
          Pronto vas a poder solicitar tu tarjeta de débito física SindiWallet
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: colors.cardHighlightStart,
    borderRadius: radius.xl, padding: spacing.xl, marginTop: spacing.md,
    minHeight: 200,
  },
  cardChip: {
    width: 40, height: 28, borderRadius: 6, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  chipText: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  cardNumber: {
    ...typography.sectionTitle, color: colors.textPrimary, letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  cardValue: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600', marginTop: 2 },
  cardBrand: {
    ...typography.caption, color: colors.primary, fontWeight: '600',
    position: 'absolute', bottom: spacing.lg, right: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionTitle, color: colors.textPrimary,
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  actionIcon: { fontSize: 22, marginRight: spacing.md },
  actionContent: { flex: 1 },
  actionTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  actionSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionChevron: { fontSize: 22, color: colors.textMuted },
  comingSoon: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed',
    padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxl,
  },
  comingSoonIcon: { fontSize: 36, marginBottom: spacing.sm },
  comingSoonTitle: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  comingSoonSub: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
