import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const fields: { label: string; value: string; set: (v: string) => void; secure?: boolean; kb?: any }[] = [
    { label: 'Full Name', value: name, set: setName },
    { label: 'Email', value: email, set: setEmail, kb: 'email-address' },
    { label: 'Phone', value: phone, set: setPhone, kb: 'phone-pad' },
    { label: 'Password', value: password, set: setPassword, secure: true },
    { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start managing your PG properties</Text>

        {fields.map((f) => (
          <View key={f.label}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input} value={f.value} onChangeText={f.set}
              placeholder={f.label} placeholderTextColor={colors.text.muted}
              secureTextEntry={f.secure} keyboardType={f.kb || 'default'} autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, color: colors.text.secondary, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, fontSize: 15, color: colors.text.primary,
  },
  btn: {
    backgroundColor: colors.accent.primary, borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 28,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  linkWrap: { alignItems: 'center', marginTop: 20 },
  linkText: { color: colors.text.secondary, fontSize: 14 },
  linkAccent: { color: colors.accent.primary, fontWeight: '600' },
});
