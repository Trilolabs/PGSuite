import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { reportsApi } from '../../lib/api';

const reportTypes = [
  { key: 'tenant_ledger', title: 'Tenant Ledger', icon: '📒', desc: 'Individual tenant payment history' },
  { key: 'detailed_tenant', title: 'Detailed Tenant', icon: '👥', desc: 'Complete tenant details report' },
  { key: 'bookings', title: 'Bookings', icon: '📅', desc: 'Booking status and history' },
  { key: 'collection', title: 'Collection', icon: '💰', desc: 'Payment collection summary' },
  { key: 'dues_pdf', title: 'Dues PDF', icon: '📄', desc: 'Outstanding dues report' },
  { key: 'expense', title: 'Expense', icon: '📊', desc: 'Expense breakdown report' },
];

export default function ReportsScreen() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    try {
      await reportsApi.generate({ type });
      Alert.alert('Success', 'Report generated successfully');
    } catch {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const renderItem = ({ item }: { item: typeof reportTypes[0] }) => (
    <View style={styles.card}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
      <TouchableOpacity
        style={styles.genBtn} onPress={() => handleGenerate(item.key)}
        disabled={generating === item.key}
      >
        {generating === item.key
          ? <ActivityIndicator color={colors.white} size="small" />
          : <Text style={styles.genBtnText}>Generate</Text>}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>
      <FlatList
        data={reportTypes} keyExtractor={(i) => i.key} renderItem={renderItem}
        numColumns={2} columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { fontSize: 20, fontWeight: '700', color: colors.text.primary, padding: 16, paddingBottom: 0 },
  row: { gap: 10 },
  card: {
    flex: 1, backgroundColor: colors.bg.card, borderRadius: 12, padding: 16,
    marginBottom: 10, alignItems: 'center',
  },
  icon: { fontSize: 32, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text.primary, textAlign: 'center' },
  desc: { fontSize: 11, color: colors.text.secondary, textAlign: 'center', marginTop: 4, lineHeight: 15 },
  genBtn: {
    backgroundColor: colors.accent.primary, borderRadius: 8, paddingHorizontal: 16,
    paddingVertical: 8, marginTop: 12, minWidth: 90, alignItems: 'center',
  },
  genBtnText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
