import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { paymentApi } from '../../lib/api';

const modeColors: Record<string, string> = {
  upi: colors.accent.info, cash: colors.accent.success, bank_transfer: colors.accent.primary,
  cheque: colors.accent.warning, online: colors.accent.info,
};

export default function CollectionScreen({ navigation }: any) {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([paymentApi.list(pid), paymentApi.summary(pid)]);
      setPayments(pRes.data.results || pRes.data || []);
      setSummary(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load payments'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => '₹' + (n ?? 0).toLocaleString('en-IN');

  const stats = [
    { label: 'Total Collection', value: fmt(summary?.total ?? 0), color: colors.accent.success },
    { label: 'Rent', value: fmt(summary?.rent ?? 0), color: colors.accent.info },
    { label: 'Deposit', value: fmt(summary?.deposit ?? 0), color: colors.accent.primary },
  ];

  const renderItem = ({ item }: any) => {
    const mc = modeColors[item.payment_mode] || colors.text.muted;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tenant}>{item.tenant_name || 'Unknown'}</Text>
            <Text style={styles.date}>{item.payment_date || item.date || '-'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amount}>{fmt(item.amount)}</Text>
            <View style={[styles.badge, { backgroundColor: mc + '22' }]}>
              <Text style={[styles.badgeText, { color: mc }]}>{(item.payment_mode || '-').replace('_', ' ')}</Text>
            </View>
          </View>
        </View>
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
        data={payments} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No payments found</Text> : null}
        contentContainerStyle={payments.length === 0 ? styles.emptyWrap : { paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ReceivePayment')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  tenant: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  date: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: colors.accent.success },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
