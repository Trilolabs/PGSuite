import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { listingApi } from '../../lib/api';

export default function ListingsScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [lRes, sRes] = await Promise.all([listingApi.list(), listingApi.stats()]);
      setListings(lRes.data.results || lRes.data || []);
      setStats(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load listings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAutoCreate = async () => {
    setCreating(true);
    try {
      await listingApi.autoCreate();
      Alert.alert('Success', 'Listings created');
      load();
    } catch { Alert.alert('Error', 'Failed to auto-create listings'); }
    finally { setCreating(false); }
  };

  const statItems = [
    { label: 'Listed', value: stats?.listed ?? 0, color: colors.accent.success },
    { label: 'Unlisted', value: stats?.unlisted ?? 0, color: colors.text.muted },
    { label: 'Views', value: stats?.total_views ?? 0, color: colors.accent.info },
    { label: 'Enquiries', value: stats?.total_enquiries ?? 0, color: colors.accent.primary },
  ];

  const fmt = (n: number) => '₹' + (n ?? 0).toLocaleString('en-IN');

  const renderItem = ({ item }: any) => {
    const isListed = item.status === 'listed' || item.is_listed;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.property_name || item.title || '-'}</Text>
            <Text style={styles.rent}>{fmt(item.rent_min ?? 0)} - {fmt(item.rent_max ?? item.rent ?? 0)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isListed ? colors.accent.success + '22' : colors.bg.tertiary }]}>
            <Text style={[styles.badgeText, { color: isListed ? colors.accent.success : colors.text.muted }]}>
              {isListed ? 'Listed' : 'Unlisted'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {statItems.map((s) => (
          <View key={s.label} style={styles.statBox}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.autoBtn} onPress={handleAutoCreate} disabled={creating}>
        {creating ? <ActivityIndicator color={colors.white} size="small" />
          : <Text style={styles.autoBtnText}>Auto-Create Listings</Text>}
      </TouchableOpacity>
      <FlatList
        data={listings} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No listings found</Text> : null}
        contentContainerStyle={listings.length === 0 ? styles.emptyWrap : { paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  statsRow: { flexDirection: 'row', padding: 16, gap: 6 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 10, color: colors.text.secondary, marginTop: 2 },
  autoBtn: {
    backgroundColor: colors.accent.primary, marginHorizontal: 16, borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 12,
  },
  autoBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  rent: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
});
