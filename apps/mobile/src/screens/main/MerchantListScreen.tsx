import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import api from '../../services/api';

interface Merchant {
  id: string;
  businessName: string;
  category: string;
  address: string | null;
  discountPercent: string;
  user: { firstName: string; lastName: string };
}

export default function MerchantListScreen() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMerchants();
  }, [selectedCategory, search]);

  const fetchMerchants = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (search) params.set('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';

      const { data } = await api.get(`/merchants${query}`);
      setMerchants(data.data.data);

      if (categories.length === 0) {
        const { data: catData } = await api.get('/merchants/categories');
        setCategories(catData.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const renderMerchant = ({ item }: { item: Merchant }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{parseFloat(item.discountPercent)}%</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.businessName}>{item.businessName}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.address && (
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar comercio..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

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
          data={merchants}
          renderItem={renderMerchant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron comercios</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchInput: {
    backgroundColor: colors.inputBackground, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.inputBorder, paddingHorizontal: spacing.md,
    height: 44, color: colors.textPrimary, ...typography.bodySmall,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
  },
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
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardLeft: { marginRight: spacing.md, justifyContent: 'center' },
  discountBadge: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    width: 48, height: 48, justifyContent: 'center', alignItems: 'center',
  },
  discountText: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  cardContent: { flex: 1 },
  businessName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  category: { ...typography.caption, color: colors.primary, marginTop: 2 },
  address: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
