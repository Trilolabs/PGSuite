import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { usePropertyStore } from '../../stores/propertyStore';
import { expenseApi } from '../../lib/api';

export default function ExpenseScreen({ navigation }: any) {
  const pid = usePropertyStore((s) => s.selectedPropertyId);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      setLoading(true);
      const [eRes, sRes] = await Promise.all([expenseApi.list(pid), expenseApi.summary(pid)]);
      setExpenses(eRes.data.results || eRes.data || []);
      setSummary(sRes.data);
    } catch { Alert.alert('Error', 'Failed to load expenses'); }
    finally { setLoading(false); }
  }, [pid]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => '₹' + (n ?? 0).toLocaleString('en-IN');

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📊</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.category}>{item.category || 'General'}</Text>
          <Text style={styles.desc}>{item.description || '-'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amount}>{fmt(item.amount)}</Text>
          <Text style={styles.date}>{item.expense_date || item.date || '-'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryVal}>{fmt(summary?.total ?? 0)}</Text>
      </View>
      <FlatList
        data={expenses} keyExtractor={(i, idx) => i.id?.toString() || idx.toString()} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No expenses found</Text> : null}
        contentContainerStyle={expenses.length === 0 ? styles.emptyWrap : { paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  summaryCard: {
    backgroundColor: colors.bg.card, margin: 16, borderRadius: 12, padding: 20,
    alignItems: 'center', borderTopWidth: 3, borderTopColor: colors.accent.danger,
  },
  summaryLabel: { fontSize: 13, color: colors.text.secondary },
  summaryVal: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginTop: 4 },
  card: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent.danger + '22', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  category: { fontSize: 15, fontWeight: '600', color: colors.text.primary, textTransform: 'capitalize' },
  desc: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: colors.accent.danger },
  date: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  empty: { color: colors.text.muted, textAlign: 'center', fontSize: 14 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
