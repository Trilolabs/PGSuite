import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';

const settingGroups = [
  {
    title: 'Property Management',
    items: ['Rooms & Beds', 'Dues Packages', 'Food Menu', 'Assets', 'Electricity'],
  },
  {
    title: 'Tenant Management',
    items: ['KYC Settings', 'Notice Period', 'Agreement Template'],
  },
  {
    title: 'Communication',
    items: ['WhatsApp Integration', 'Notifications', 'SMS Templates'],
  },
];

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { properties, selectedPropertyId, setSelectedProperty } = usePropertyStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        {user?.role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Properties</Text>
        {properties.map((p) => (
          <TouchableOpacity key={p.id} style={styles.propItem}
            onPress={() => setSelectedProperty(p.id)}>
            <View style={[styles.radio, p.id === selectedPropertyId && styles.radioActive]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.propName}>{p.name}</Text>
              <Text style={styles.propCode}>{p.code} · {p.city}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {settingGroups.map((group) => (
        <View key={group.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <TouchableOpacity key={item} style={styles.settingItem}>
              <Text style={styles.settingText}>{item}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  profileCard: {
    backgroundColor: colors.bg.card, margin: 16, borderRadius: 12,
    padding: 20, alignItems: 'center',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent.primary + '33',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { color: colors.accent.primary, fontSize: 24, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  email: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  roleBadge: {
    backgroundColor: colors.accent.primary + '22', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 8,
  },
  roleText: { color: colors.accent.primary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  section: { backgroundColor: colors.bg.card, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12 },
  propItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.primary },
  propName: { fontSize: 14, fontWeight: '500', color: colors.text.primary },
  propCode: { fontSize: 12, color: colors.text.secondary },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  settingText: { fontSize: 14, color: colors.text.primary },
  arrow: { fontSize: 20, color: colors.text.muted },
  logoutBtn: {
    backgroundColor: colors.accent.danger + '22', marginHorizontal: 16,
    borderRadius: 10, padding: 16, alignItems: 'center',
  },
  logoutText: { color: colors.accent.danger, fontSize: 16, fontWeight: '600' },
});
