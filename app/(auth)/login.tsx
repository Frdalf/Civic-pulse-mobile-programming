import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorText } from '@/components/ui/ErrorText';
import { FormScreen } from '@/components/ui/FormScreen';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { isSupabaseConfigured } from '@/services/supabase';
import { useAuthStore } from '@/store';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase belum dikonfigurasi (.env kosong).',
  );
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password); // auth gate otomatis pindah ke (tabs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal masuk.');
      setLoading(false);
    }
  };

  return (
    <FormScreen>
      <Text style={styles.title} accessibilityRole="header">
        Civic Pulse
      </Text>
      <Text style={styles.subtitle}>Masuk untuk melaporkan masalah di kotamu.</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="nama@email.com"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />
      <ErrorText message={error} />
      <Button label="Masuk" onPress={onSubmit} loading={loading} />
      <Link href="/register" style={styles.link}>
        Belum punya akun? Daftar
      </Link>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 48, fontSize: 32, fontWeight: '800', color: colors.primary },
  subtitle: { marginTop: 4, marginBottom: 24, color: colors.textMuted },
  link: {
    marginTop: 16,
    padding: 12,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});
