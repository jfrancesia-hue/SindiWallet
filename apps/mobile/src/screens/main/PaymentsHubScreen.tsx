import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const paymentOptions = [
  { icon: '⊞', label: 'Pagar con QR', screen: 'QrPay', description: 'Escaneá y pagá en comercios' },
  { icon: '↗', label: 'Transferir', screen: 'Transfer', description: 'A otro afiliado de tu sindicato' },
  { icon: '🏦', label: 'Transferir CVU', screen: 'TransferCvu', description: 'A cualquier cuenta bancaria' },
  { icon: '📱', label: 'Cobrar con QR', screen: 'QrGenerate', description: 'Generá tu QR de cobro' },
];

const services = [
  { icon: '💡', label: 'Luz' },
  { icon: '🔥', label: 'Gas' },
  { icon: '📺', label: 'Cable' },
  { icon: '📱', label: 'Celular' },
  { icon: '🌐', label: 'Internet' },
  { icon: '💧', label: 'Agua' },
];

export default function PaymentsHubScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Operaciones</Text>

      {paymentOptions.map((opt) => (
        <TouchableOpacity
          key={opt.label}
          style={styles.optionCard}
          onPress={() => navigation.navigate('Home', { screen: opt.screen })}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>{opt.icon}</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{opt.label}</Text>
            <Text style={styles.optionSub}>{opt.description}</Text>
          </View>
          <Text style={styles.optionChevron}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Pagar servicios</Text>
      <Text style={styles.sectionSub}>Próximamente</Text>

      <View style={styles.servicesGrid}>
        {services.map((s) => (
          <TouchableOpacity key={s.label} style={styles.serviceItem}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>{s.icon}</Text>
            </View>
            <Text style={styles.serviceLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  sectionTitle: {
    ...typography.sectionTitle, color: colors.textPrimary,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionSub: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  optionIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, justifyContent: 'center',
    alignItems: 'center', marginRight: spacing.md,
  },
  optionIconText: { fontSize: 22, color: colors.textPrimary },
  optionContent: { flex: 1 },
  optionTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  optionSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  optionChevron: { fontSize: 22, color: colors.textMuted },
  servicesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  serviceItem: { alignItems: 'center', width: '28%' },
  serviceIcon: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: colors.surface, justifyContent: 'center',
    alignItems: 'center', marginBottom: spacing.xs,
  },
  serviceIconText: { fontSize: 24 },
  serviceLabel: { ...typography.caption, color: colors.textSecondary },
});
