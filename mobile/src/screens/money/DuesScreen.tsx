import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { duesApi } from '../../lib/api';

const statusStyles: Record<string, { bg: string; fg: string }> = {
  paid: { bg: colors.accent.success + '22', fg: colors.accent.success },
  unpaid: { bg: colors.accent.danger + '22', fg: colors.accent.danger },
  partial: { bg: colors.accent.warning + '22', fg: colors.accent.warning },
};

export default function DuesScreen() {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [dues, setDues] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const [dRes, sRes] = await Promise.all([duesApi.list(pid), duesApi.summary(pid)]);
      setDues(dRes.data.results || dRes.data || []);
      setSummary(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load dues'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => '₹' + (n ?? 0).toLocaleString('en-IN');

  const stats = [
    { label: 'All Dues', value: fmt(summary?.total_dues ?? 0), color: colors.accent.primary },
    { label: 'Current', value: fmt(summary?.current_dues ?? 0), color: colors.accent.info },
    { label: 'Rent Dues', value: fmt(summary?.rent_dues ?? 0), color: colors.accent.danger },
  ];

  const renderItem = ({ item }: any) => {
    const s = statusStyles[item.status] || statusStyles.unpaid;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tenant}>{item.tenant_name || 'Unknown'}</Text>
            <Text style={styles.type}>{item.due_type || item.type || '-'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amount}>{fmt(item.amount)}</Text>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <Text style={[styles.badgeText, { color: s.fg }]}>{item.status}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.date}>Due: {item.due_date || '-'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statBox, { borderTopColor: s.color }]}>
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={dues} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No dues found</Text> : null}
        contentContainerStyle={dues.length === 0 ? styles.emptyWrap : { paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 12, borderTopWidth: 3, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  statLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  tenant: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  type: { fontSize: 12, color: colors.text.secondary, marginTop: 2, textTransform: 'capitalize' },
  amount: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  date: { fontSize: 12, color: colors.text.muted, marginTop: 8 },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
});
