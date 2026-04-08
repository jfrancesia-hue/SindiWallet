import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

export default function QrGenerateScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qrResult, setQrResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido');
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await api.post('/payments/qr/generate', {
        amount: numAmount,
        description: description || undefined,
      });
      setQrResult(data.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo generar el QR');
    } finally {
      setIsLoading(false);
    }
  };

  if (qrResult) {
    return (
      <View style={styles.container}>
        <View style={styles.qrCard}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR</Text>
            <Text style={styles.qrPlaceholderSub}>Escaneá para pagar</Text>
          </View>

          <Text style={styles.qrAmount}>
            ${qrResult.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.qrRecipient}>{qrResult.recipientName}</Text>
          <Text style={styles.qrCvu}>CVU: {qrResult.cvu}</Text>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => {
            setQrResult(null);
            setAmount('');
            setDescription('');
          }}
        >
          <Text style={styles.newButtonText}>Generar otro QR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuánto querés cobrar?</Text>

      <View style={styles.amountSection}>
        <Text style={styles.currencySign}>$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Descripción (opcional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Generar QR de cobro</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  currencySign: {
    ...typography.balanceAmount,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  amountInput: {
    ...typography.balanceAmount,
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 120,
  },
  descriptionInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
    height: 48,
    color: colors.textPrimary,
    ...typography.body,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { ...typography.button, color: colors.textPrimary },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.background,
  },
  qrPlaceholderSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  qrAmount: {
    ...typography.balanceAmount,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  qrRecipient: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  qrCvu: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  newButton: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: { ...typography.button, color: colors.textSecondary },
});
