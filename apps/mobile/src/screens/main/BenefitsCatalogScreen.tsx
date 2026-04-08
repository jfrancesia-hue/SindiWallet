import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

const CATEGORY_ICONS: Record<string, string> = {
  Familia: '👶',
  Educación: '📚',
  Emergencia: '🚨',
  Turismo: '✈',
  Salud: '🏥',
  default: '🎁',
};

interface Benefit {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: string | null;
  maxAmount: string | null;
  requiresApproval: boolean;
}

export default function BenefitsCatalogScreen() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBenefits();
  }, [selectedCategory]);

  const fetchBenefits = async () => {
    try {
      setIsLoading(true);
      const params = selectedCategory ? `?category=${selectedCategory}` : '';
      const { data } = await api.get(`/benefits${params}`);
      setBenefits(data.data);

      if (categories.length === 0) {
        const { data: catData } = await api.get('/benefits/categories');
        setCategories(catData.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (benefit: Benefit) => {
    const amount = benefit.amount ? parseFloat(benefit.amount) : 0;

    Alert.alert(
      'Solicitar Beneficio',
      `¿Querés solicitar "${benefit.name}" por $${amount.toLocaleString('es-AR')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              await api.post('/benefits/request', {
                benefitId: benefit.id,
                amount,
              });
              Alert.alert(
                'Solicitud enviada',
                benefit.requiresApproval
                  ? 'Tu solicitud será revisada por el sindicato.'
                  : 'Beneficio aprobado automáticamente.',
              );
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message ?? 'No se pudo enviar');
            }
          },
        },
      ],
    );
  };

  const renderBenefit = ({ item }: { item: Benefit }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleRequest(item)}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>
          {CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.default}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          {item.amount && (
            <Text style={styles.cardAmount}>
              ${parseFloat(item.amount).toLocaleString('es-AR')}
            </Text>
          )}
          {item.requiresApproval && (
            <View style={styles.approvalBadge}>
              <Text style={styles.approvalText}>Requiere aprobación</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Category Filters */}
      <FlatList
        horizontal
        data={[null, ...categories]}
        keyExtractor={(item) => item ?? 'all'}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedCategory === item && styles.chipActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>
              {item ?? 'Todos'}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.chipRow}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={benefits}
          renderItem={renderBenefit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay beneficios disponibles</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.card, marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.bodySmall, color: colors.textSecondary },
  chipTextActive: { color: colors.textPrimary, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg },
  card: {
    flexDirection: 'row', backgroundColor: colors.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder,
    padding: spacing.md, marginBottom: spacing.md,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.surface, justifyContent: 'center',
    alignItems: 'center', marginRight: spacing.md,
  },
  cardIconText: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  cardDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  cardAmount: { ...typography.body, color: colors.primary, fontWeight: '700' },
  approvalBadge: {
    backgroundColor: colors.accent, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  approvalText: { ...typography.caption, color: colors.textPrimary, fontSize: 10 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
