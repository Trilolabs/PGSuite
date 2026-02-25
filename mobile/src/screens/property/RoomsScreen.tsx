import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { roomApi } from '../../lib/api';

const typeColors: Record<string, string> = {
  single: colors.accent.info, double: colors.accent.success, triple: colors.accent.warning, dormitory: colors.accent.primary,
};

export default function RoomsScreen() {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([roomApi.list(pid), roomApi.stats(pid)]);
      setRooms(rRes.data.results || rRes.data || []);
      setStats(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load rooms'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const statItems = [
    { label: 'Rooms', value: stats?.total_rooms ?? 0, color: colors.accent.primary },
    { label: 'Beds', value: stats?.total_beds ?? 0, color: colors.accent.info },
    { label: 'Vacant', value: stats?.vacant_beds ?? 0, color: colors.accent.success },
    { label: 'Occupied', value: stats?.occupied_beds ?? 0, color: colors.accent.warning },
  ];

  const renderItem = ({ item }: any) => {
    const totalBeds = item.total_beds || 1;
    const occupied = item.occupied_beds || 0;
    const pct = Math.min((occupied / totalBeds) * 100, 100);
    const tc = typeColors[item.room_type] || colors.text.muted;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomNum}>Room {item.room_number || item.number}</Text>
          <View style={[styles.typeBadge, { backgroundColor: tc + '22' }]}>
            <Text style={[styles.typeText, { color: tc }]}>{item.room_type || '-'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.detail}>Floor: {item.floor ?? '-'}</Text>
          <Text style={styles.detail}>Beds: {occupied}/{totalBeds}</Text>
          <Text style={styles.detail}>Rent: ₹{(item.rent ?? 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: pct === 100 ? colors.accent.danger : colors.accent.success }]} />
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
      <FlatList
        data={rooms} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No rooms found</Text> : null}
        contentContainerStyle={rooms.length === 0 ? styles.emptyWrap : { paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomNum: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  typeBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  typeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  detail: { fontSize: 13, color: colors.text.secondary },
  barBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 10 },
  barFill: { height: 4, borderRadius: 2 },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
});
