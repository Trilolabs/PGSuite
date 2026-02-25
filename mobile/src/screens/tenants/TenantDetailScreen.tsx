import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { tenantApi } from '../../lib/api';

const statusColor: Record<string, string> = {
  active: colors.accent.success, under_notice: colors.accent.warning, checked_out: colors.text.muted,
};

export default function TenantDetailScreen({ route }: any) {
  const { id } = route.params;
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pid) return;
    (async () => {
      try {
        const res = await tenantApi.get(pid, id);
        setTenant(res.data);
      } catch { Alert.alert('Error', 'Failed to load tenant details'); }
      finally { setLoading(false); }
    })();
  }, [pid, id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.accent.primary} /></View>;
  if (!tenant) return <View style={styles.center}><Text style={styles.empty}>Tenant not found</Text></View>;

  const initials = (tenant.name || '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const sc = statusColor[tenant.status] || colors.text.muted;

  const personalInfo = [
    { label: 'Phone', value: tenant.phone },
    { label: 'Email', value: tenant.email || '-' },
    { label: 'Gender', value: tenant.gender || '-' },
    { label: 'Type', value: tenant.tenant_type || '-' },
  ];
  const stayInfo = [
    { label: 'Move In', value: tenant.move_in_date || '-' },
    { label: 'Rent', value: `₹${(tenant.rent ?? 0).toLocaleString('en-IN')}` },
    { label: 'Deposit', value: `₹${(tenant.deposit ?? 0).toLocaleString('en-IN')}` },
    { label: 'Room', value: tenant.room_number || '-' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.name}>{tenant.name}</Text>
        <View style={[styles.badge, { backgroundColor: sc + '22' }]}>
          <Text style={[styles.badgeText, { color: sc }]}>{(tenant.status || '').replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        {personalInfo.map((i) => (
          <View key={i.label} style={styles.row}>
            <Text style={styles.rowLabel}>{i.label}</Text>
            <Text style={styles.rowValue}>{i.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stay Details</Text>
        {stayInfo.map((i) => (
          <View key={i.label} style={styles.row}>
            <Text style={styles.rowLabel}>{i.label}</Text>
            <Text style={styles.rowValue}>{i.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KYC</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={[styles.rowValue, { color: tenant.kyc_verified ? colors.accent.success : colors.accent.warning }]}>
            {tenant.kyc_verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent.warning + '22' }]}
          onPress={() => Alert.alert('Notice', 'Give notice to this tenant?')}>
          <Text style={[styles.actionText, { color: colors.accent.warning }]}>Give Notice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent.danger + '22' }]}
          onPress={() => Alert.alert('Checkout', 'Checkout this tenant?')}>
          <Text style={[styles.actionText, { color: colors.accent.danger }]}>Checkout</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.text.muted, fontSize: 14 },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent.primary + '33',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: colors.accent.primary, fontWeight: '700', fontSize: 24 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  section: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.text.secondary },
  rowValue: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  actions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600' },
});
