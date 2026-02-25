import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { dashboardApi } from '../../lib/api';

export default function DashboardScreen({ navigation }: any) {
  const { properties, selectedPropertyId, setSelectedProperty } = usePropertyStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.overview();
      setData(res.data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedPropertyId]);

  const property = properties.find((p) => p.id === selectedPropertyId);

  const stats = [
    { label: "Today's Collection", value: data?.today_collection ?? 0, color: colors.accent.success },
    { label: 'Monthly Collection', value: data?.monthly_collection ?? 0, color: colors.accent.info },
    { label: 'Monthly Dues', value: data?.monthly_dues ?? 0, color: colors.accent.warning },
    { label: 'Total Dues', value: data?.total_dues ?? 0, color: colors.accent.danger },
    { label: 'Expenses', value: data?.expenses ?? 0, color: colors.accent.primary },
  ];

  const actions = [
    { label: 'Add Tenant', icon: '👤', screen: 'Tenants' },
    { label: 'Receive Payment', icon: '💰', screen: 'Collection' },
    { label: 'Add Lead', icon: '📋', screen: 'More' },
    { label: 'Add Expense', icon: '📊', screen: 'Expenses' },
  ];

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  if (loading && !data) return (
    <View style={styles.center}><ActivityIndicator size="large" color={colors.accent.primary} /></View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}>
      {properties.length > 1 && (
        <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(!showPicker)}>
          <Text style={styles.pickerText}>{property?.name || 'Select Property'}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
      )}
      {showPicker && properties.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.pickerItem, p.id === selectedPropertyId && styles.pickerActive]}
          onPress={() => { setSelectedProperty(p.id); setShowPicker(false); }}>
          <Text style={styles.pickerItemText}>{p.name}</Text>
        </TouchableOpacity>
      ))}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={styles.statValue}>{fmt(s.value)}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {property && (
        <View style={styles.propCard}>
          <Text style={styles.propName}>{property.name}</Text>
          <Text style={styles.propCode}>{property.code} · {property.type}</Text>
          <View style={styles.propStats}>
            <View style={styles.propStat}><Text style={styles.propStatVal}>{property.total_rooms}</Text><Text style={styles.propStatLbl}>Rooms</Text></View>
            <View style={styles.propStat}><Text style={styles.propStatVal}>{property.total_beds}</Text><Text style={styles.propStatLbl}>Beds</Text></View>
            <View style={styles.propStat}><Text style={styles.propStatVal}>{property.occupied_beds}</Text><Text style={styles.propStatLbl}>Occupied</Text></View>
            <View style={styles.propStat}><Text style={styles.propStatVal}>{property.total_beds - property.occupied_beds}</Text><Text style={styles.propStatLbl}>Vacant</Text></View>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: 16 },
  center: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.bg.card, padding: 14, borderRadius: 10, marginBottom: 8,
  },
  pickerText: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  pickerArrow: { color: colors.text.muted, fontSize: 12 },
  pickerItem: { backgroundColor: colors.bg.secondary, padding: 12, borderRadius: 8, marginBottom: 4 },
  pickerActive: { borderColor: colors.accent.primary, borderWidth: 1 },
  pickerItemText: { color: colors.text.primary, fontSize: 14 },
  statsRow: { marginVertical: 12 },
  statCard: {
    backgroundColor: colors.bg.card, borderRadius: 10, padding: 16, marginRight: 12,
    minWidth: 150, borderLeftWidth: 3,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  propCard: { backgroundColor: colors.bg.card, borderRadius: 12, padding: 16, marginVertical: 8 },
  propName: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  propCode: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  propStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  propStat: { alignItems: 'center' },
  propStatVal: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  propStatLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 16, marginBottom: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    backgroundColor: colors.bg.card, borderRadius: 10, padding: 18, width: '48%' as any,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: 13, color: colors.text.primary, fontWeight: '500' },
});
