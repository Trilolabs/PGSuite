import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { taskApi } from '../../lib/api';

const priorityColor: Record<string, string> = {
  low: colors.accent.info, medium: colors.accent.warning, high: colors.accent.danger, urgent: colors.accent.danger,
};
const statusColor: Record<string, string> = {
  pending: colors.accent.warning, in_progress: colors.accent.info, completed: colors.accent.success,
};

const TABS = ['All', 'Pending', 'In Progress', 'Completed'] as const;
const tabFilter: Record<string, string | undefined> = {
  All: undefined, Pending: 'pending', 'In Progress': 'in_progress', Completed: 'completed',
};

export default function TasksScreen({ navigation }: any) {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const params = tabFilter[tab] ? { status: tabFilter[tab] } : undefined;
      const [tRes, sRes] = await Promise.all([taskApi.list(pid, params), taskApi.stats(pid)]);
      setTasks(tRes.data.results || tRes.data || []);
      setStats(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load tasks'); }
    finally { setLoading(false); }
  }, [pid, tab]);

  useEffect(() => { load(); }, [load]);

  const statItems = [
    { label: 'Total', value: stats?.total ?? 0, color: colors.accent.primary },
    { label: 'Pending', value: stats?.pending ?? 0, color: colors.accent.warning },
    { label: 'In Progress', value: stats?.in_progress ?? 0, color: colors.accent.info },
    { label: 'Completed', value: stats?.completed ?? 0, color: colors.accent.success },
  ];

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
        <View style={styles.cardBottom}>
          <View style={[styles.priBadge, { backgroundColor: pc + '22' }]}>
            <Text style={[styles.priText, { color: pc }]}>{item.priority || '-'}</Text>
          </View>
          {item.due_date && <Text style={styles.date}>Due: {item.due_date}</Text>}
          {item.assigned_to_name && <Text style={styles.assigned}>→ {item.assigned_to_name}</Text>}
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
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={tasks} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No tasks found</Text> : null}
        contentContainerStyle={tasks.length === 0 ? styles.emptyWrap : { paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  statsRow: { flexDirection: 'row', padding: 16, gap: 6 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 10, color: colors.text.secondary, marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 6 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.bg.tertiary },
  tabActive: { backgroundColor: colors.accent.primary },
  tabText: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },
  tabTextActive: { color: colors.white },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text.primary, flex: 1, marginRight: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  priBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  priText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  date: { fontSize: 11, color: colors.text.muted },
  assigned: { fontSize: 11, color: colors.text.secondary },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
