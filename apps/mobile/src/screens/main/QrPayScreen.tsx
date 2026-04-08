import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';
import { randomUUID } from 'expo-crypto';

export default function QrPayScreen({ navigation }: any) {
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // En producción esto sería CameraView de expo-camera
  const handleScanQr = async () => {
    // Mock: simular escaneo de QR
    const mockQrData = Buffer.from(
      JSON.stringify({
        version: '01',
        initiationMethod: '11',
        merchant: { cvu: '0000003100025419479867', name: 'Test Merchant' },
        currency: '032',
        amount: '1500.00',
        description: 'Compra en comercio',
        timestamp: new Date().toISOString(),
      }),
    ).toString('base64');

    try {
      setIsLoading(true);
      const { data } = await api.post('/payments/qr/preview', { qrData: mockQrData });
      setPreview({ ...data.data, qrData: mockQrData });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'QR no válido');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!preview) return;
    try {
      setIsPaying(true);
      await api.post('/payments/qr/pay', {
        qrData: preview.qrData,
        amount: preview.finalAmount,
        idempotencyKey: randomUUID(),
      });
      Alert.alert('Pago exitoso', `Pagaste $${preview.finalAmount.toFixed(2)} ARS`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo procesar el pago');
    } finally {
      setIsPaying(false);
    }
  };

  if (!preview) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraText}>Cámara QR</Text>
          <Text style={styles.cameraSubtext}>Escaneá el código QR del comercio</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleScanQr}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>Simular escaneo QR</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.confirmCard}>
        <View style={styles.merchantIcon}>
          <Text style={styles.merchantIconText}>🏪</Text>
        </View>
        <Text style={styles.merchantName}>{preview.merchant.name}</Text>

        {preview.discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              Descuento Afiliado {preview.discountPercent}%
            </Text>
          </View>
        )}

        {preview.discountPercent > 0 && (
          <Text style={styles.originalPrice}>
            ${preview.originalAmount.toFixed(2)}
          </Text>
        )}

        <Text style={styles.finalAmount}>
          ${preview.finalAmount.toFixed(2)}
        </Text>
        <Text style={styles.finalLabel}>Monto final</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isPaying && styles.buttonDisabled]}
        onPress={handlePay}
        disabled={isPaying}
      >
        {isPaying ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Confirmar pago</Text>
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
  cameraPlaceholder: {
    height: 300,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cameraText: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
  },
  cameraSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  confirmCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  merchantIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  merchantIconText: { fontSize: 30 },
  merchantName: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  discountBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  discountText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  originalPrice: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: spacing.xs,
  },
  finalAmount: {
    ...typography.balanceAmount,
    color: colors.textPrimary,
  },
  finalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
});
