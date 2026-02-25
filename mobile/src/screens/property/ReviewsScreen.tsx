import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { reviewApi } from '../../lib/api';

const Stars = ({ rating }: { rating: number }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆'));
  return <Text style={styles.stars}>{stars.join('')}</Text>;
};

export default function ReviewsScreen() {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([reviewApi.list(pid), reviewApi.summary(pid)]);
      setReviews(rRes.data.results || rRes.data || []);
      setSummary(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load reviews'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Stars rating={item.rating || 0} />
        {item.category && (
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
        )}
      </View>
      <Text style={styles.tenant}>{item.tenant_name || 'Anonymous'}</Text>
      <Text style={styles.comment}>{item.comment || 'No comment'}</Text>
      {item.admin_response ? (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText}>{item.admin_response}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.ratingWrap}>
          <Text style={styles.avgRating}>{(summary?.average_rating ?? 0).toFixed(1)}</Text>
          <Stars rating={Math.round(summary?.average_rating ?? 0)} />
        </View>
        <Text style={styles.totalCount}>{summary?.total_reviews ?? 0} reviews</Text>
      </View>
      <FlatList
        data={reviews} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No reviews yet</Text> : null}
        contentContainerStyle={reviews.length === 0 ? styles.emptyWrap : { paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  summaryCard: {
    backgroundColor: colors.bg.card, margin: 16, borderRadius: 12, padding: 20, alignItems: 'center',
  },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avgRating: { fontSize: 32, fontWeight: '700', color: colors.text.primary },
  totalCount: { fontSize: 13, color: colors.text.secondary, marginTop: 4 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { fontSize: 16, color: colors.accent.warning },
  catBadge: { backgroundColor: colors.accent.info + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 10, color: colors.accent.info, fontWeight: '600', textTransform: 'capitalize' },
  tenant: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginTop: 8 },
  comment: { fontSize: 13, color: colors.text.secondary, marginTop: 4, lineHeight: 18 },
  response: { backgroundColor: colors.bg.tertiary, borderRadius: 8, padding: 10, marginTop: 8 },
  responseLabel: { fontSize: 11, fontWeight: '600', color: colors.accent.primary, marginBottom: 2 },
  responseText: { fontSize: 12, color: colors.text.secondary, lineHeight: 16 },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
});
