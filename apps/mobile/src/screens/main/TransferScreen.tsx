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
  FlatList,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';
import { randomUUID } from 'expo-crypto';

const recentContacts = [
  { id: '1', initials: 'MG', name: 'María' },
  { id: '2', initials: 'JP', name: 'Juan' },
  { id: '3', initials: 'LC', name: 'Laura' },
  { id: '4', initials: 'RD', name: 'Roberto' },
];

export default function TransferScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [walletToId, setWalletToId] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido');
      return;
    }
    if (!walletToId) {
      Alert.alert('Error', 'Ingresá el ID o CVU del destinatario');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/transactions/transfer', {
        walletToId,
        amount: numAmount,
        description,
        idempotencyKey: randomUUID(),
      });
      Alert.alert('Transferencia exitosa', `Se enviaron $${numAmount.toFixed(2)} ARS`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo realizar la transferencia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar contacto o ingresá wallet ID..."
        placeholderTextColor={colors.textMuted}
        value={walletToId}
        onChangeText={setWalletToId}
      />

      <Text style={styles.sectionLabel}>Contactos recientes</Text>
      <FlatList
        horizontal
        data={recentContacts}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitials}>{item.initials}</Text>
            </View>
            <Text style={styles.contactName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.contactList}
      />

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
        onPress={handleTransfer}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Continuar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
    height: 48,
    color: colors.textPrimary,
    ...typography.body,
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactList: {
    paddingVertical: spacing.sm,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contactInitials: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  contactName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxl,
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
    minWidth: 100,
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
  buttonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
