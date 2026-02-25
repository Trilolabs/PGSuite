import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';

const menuItems = [
  { label: 'Bookings', icon: '📅', screen: 'Bookings' },
  { label: 'Old Tenants', icon: '🏠', screen: 'OldTenants' },
  { label: 'Leads', icon: '📋', screen: 'Leads' },
  { label: 'Team', icon: '👥', screen: 'Team' },
  { label: 'Dues Package', icon: '📦', screen: 'DuesPackage' },
  { label: 'Food', icon: '🍽️', screen: 'Food' },
  { label: 'Assets', icon: '🏗️', screen: 'Assets' },
  { label: 'Electricity', icon: '⚡', screen: 'Electricity' },
  { label: 'Banks', icon: '🏦', screen: 'Banks' },
  { label: 'WhatsApp', icon: '💬', screen: 'WhatsApp' },
  { label: 'Tasks', icon: '📝', screen: 'Tasks' },
  { label: 'Listings', icon: '🌐', screen: 'Listings' },
  { label: 'Reports', icon: '📊', screen: 'Reports' },
  { label: 'Reviews', icon: '⭐', screen: 'Reviews' },
  { label: 'Complaints', icon: '🔔', screen: 'Complaints' },
  { label: 'Settings', icon: '⚙️', screen: 'Settings' },
];

export default function MoreScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>More</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label} style={styles.card}
            onPress={() => {
              try { navigation.navigate(item.screen); }
              catch { /* screen may not exist yet */ }
            }}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '31%' as any, backgroundColor: colors.bg.card, borderRadius: 12,
    padding: 16, alignItems: 'center', minHeight: 90, justifyContent: 'center',
  },
  icon: { fontSize: 28, marginBottom: 8 },
  label: { fontSize: 12, color: colors.text.primary, fontWeight: '500', textAlign: 'center' },
});
