import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { tenantApi } from '../../lib/api';

const statusColor: Record<string, string> = {
  active: colors.accent.success, under_notice: colors.accent.warning, checked_out: colors.text.muted,
};

export default function TenantsScreen({ navigation }: any) {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const res = await tenantApi.list(pid, search ? { search } : undefined);
      setTenants(res.data.results || res.data || []);
    } catch { Alert.alert('Error', 'Failed to load tenants'); }
    finally { setLoading(false); }
  }, [pid, search]);

  useEffect(() => { load(); }, [load]);

  const active = tenants.filter((t) => t.status === 'active').length;
  const notice = tenants.filter((t) => t.status === 'under_notice').length;
  const out = tenants.filter((t) => t.status === 'checked_out').length;

  const stats = [
    { label: 'Total', value: tenants.length, color: colors.accent.primary },
    { label: 'Active', value: active, color: colors.accent.success },
    { label: 'Notice', value: notice, color: colors.accent.warning },
    { label: 'Out', value: out, color: colors.text.muted },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TenantDetail', { id: item.id })}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || '?')[0]}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.phone} · Room {item.room_number || '-'}</Text>
        </View>
        <View>
          <Text style={styles.rent}>₹{(item.rent ?? 0).toLocaleString('en-IN')}</Text>
          <View style={[styles.badge, { backgroundColor: (statusColor[item.status] || colors.text.muted) + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor[item.status] || colors.text.muted }]}>
              {(item.status || 'unknown').replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search} placeholder="Search tenants…" placeholderTextColor={colors.text.muted}
        value={search} onChangeText={setSearch} onSubmitEditing={load} returnKeyType="search"
      />
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statBox}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={tenants} keyExtractor={(i) => i.id?.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No tenants found</Text> : null}
        contentContainerStyle={tenants.length === 0 ? styles.emptyContainer : undefined}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTenant')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  search: {
    backgroundColor: colors.bg.secondary, margin: 16, marginBottom: 8, borderRadius: 10,
    padding: 12, fontSize: 15, color: colors.text.primary, borderWidth: 1, borderColor: colors.border,
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent.primary + '33', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent.primary, fontWeight: '700', fontSize: 16 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  sub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  rent: { fontSize: 15, fontWeight: '700', color: colors.text.primary, textAlign: 'right' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-end' },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14, marginTop: 40 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
