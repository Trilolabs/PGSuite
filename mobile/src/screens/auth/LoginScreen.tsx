import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>PG</Text>
          </View>
          <Text style={styles.title}>PG Manager</Text>
          <Text style={styles.subtitle}>Manage your properties effortlessly</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.text.muted}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input} placeholder="••••••••" placeholderTextColor={colors.text.muted}
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.white },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  form: { marginBottom: 24 },
  label: { fontSize: 13, color: colors.text.secondary, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, fontSize: 15, color: colors.text.primary,
  },
  btn: {
    backgroundColor: colors.accent.primary, borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  linkWrap: { alignItems: 'center' },
  linkText: { color: colors.text.secondary, fontSize: 14 },
  linkAccent: { color: colors.accent.primary, fontWeight: '600' },
});
