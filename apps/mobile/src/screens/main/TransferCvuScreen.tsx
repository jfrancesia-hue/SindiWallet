import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';
import { randomUUID } from 'expo-crypto';

export default function TransferCvuScreen({ navigation }: any) {
  const [cvu, setCvu] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (cvu.length !== 22) {
      Alert.alert('Error', 'El CVU debe tener 22 dígitos');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/transactions/transfer-cvu', {
        destinationCvu: cvu,
        amount: numAmount,
        description,
        idempotencyKey: randomUUID(),
      });
      Alert.alert(
        'Transferencia enviada',
        `Se enviaron $${numAmount.toFixed(2)} al CVU ${cvu}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo realizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>CVU destino</Text>
      <TextInput
        style={styles.input}
        placeholder="22 dígitos numéricos"
        placeholderTextColor={colors.textMuted}
        value={cvu}
        onChangeText={(t) => setCvu(t.replace(/\D/g, '').slice(0, 22))}
        keyboardType="number-pad"
        maxLength={22}
      />
      <Text style={styles.counter}>{cvu.length}/22</Text>

      <Text style={styles.label}>Monto</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currencySign}>$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.label}>Descripción (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Alquiler marzo"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleTransfer}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Transferir por CVU</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
  },
  label: {
    ...typography.caption, color: colors.textSecondary,
    marginBottom: spacing.xs, marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBackground, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md, height: 48,
    color: colors.textPrimary, ...typography.body,
  },
  counter: {
    ...typography.caption, color: colors.textMuted,
    textAlign: 'right', marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.inputBackground, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md, height: 48,
  },
  currencySign: { ...typography.sectionTitle, color: colors.textMuted, marginRight: spacing.sm },
  amountInput: { flex: 1, color: colors.textPrimary, ...typography.body },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { ...typography.button, color: colors.textPrimary },
});
