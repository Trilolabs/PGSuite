import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { complaintApi } from '../../lib/api';

const priorityColor: Record<string, string> = {
  low: colors.accent.info, medium: colors.accent.warning, high: colors.accent.danger, urgent: colors.accent.danger,
};
const statusColor: Record<string, string> = {
  open: colors.accent.warning, in_progress: colors.accent.info, resolved: colors.accent.success, closed: colors.text.muted,
};

export default function ComplaintsScreen({ navigation }: any) {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const res = await complaintApi.list(pid);
      setComplaints(res.data.results || res.data || []);
    } catch { Alert.alert('Error', 'Failed to load complaints'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const openCount = complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  const renderItem = ({ item }: any) => {
    const pc = priorityColor[item.priority] || colors.text.muted;
    const sc = statusColor[item.status] || colors.text.muted;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: sc + '22' }]}>
            <Text style={[styles.badgeText, { color: sc }]}>{(item.status || '').replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.category}>{item.category || '-'}</Text>
        <View style={styles.cardBottom}>
          <View style={[styles.priBadge, { backgroundColor: pc + '22' }]}>
            <Text style={[styles.priBadgeText, { color: pc }]}>{item.priority || '-'}</Text>
          </View>
          <Text style={styles.tenant}>{item.tenant_name || '-'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderTopColor: colors.accent.warning }]}>
          <Text style={styles.statVal}>{openCount}</Text>
          <Text style={styles.statLbl}>Open</Text>
        </View>
        <View style={[styles.statBox, { borderTopColor: colors.accent.success }]}>
          <Text style={styles.statVal}>{resolvedCount}</Text>
          <Text style={styles.statLbl}>Resolved</Text>
        </View>
      </View>
      <FlatList
        data={complaints} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No complaints found</Text> : null}
        contentContainerStyle={complaints.length === 0 ? styles.emptyWrap : { paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewComplaint')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 12, borderTopWidth: 3, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  statLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text.primary, flex: 1, marginRight: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  category: { fontSize: 12, color: colors.text.secondary, marginTop: 4, textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  priBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  priBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  tenant: { fontSize: 12, color: colors.text.muted },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
