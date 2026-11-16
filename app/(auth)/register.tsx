import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorText } from '@/components/ui/ErrorText';
import { FormScreen } from '@/components/ui/FormScreen';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store';

const NIK_PATTERN = /^\d{16}$/;

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || password.length < 6) {
      setError('Isi email dan password (minimal 6 karakter).');
      return;
    }
    if (nik && !NIK_PATTERN.test(nik)) {
      setError('NIK harus 16 digit angka.');
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const loggedIn = await register(email, password, nik || undefined);
      if (!loggedIn) setInfo('Pendaftaran berhasil. Cek email untuk konfirmasi, lalu masuk.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen>
      <Text style={styles.title} accessibilityRole="header">Daftar Akun</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextField
        label="NIK (opsional)"
        value={nik}
        onChangeText={setNik}
        keyboardType="number-pad"
        maxLength={16}
        placeholder="16 digit"
      />
      <Text style={styles.note}>NIK hanya disimpan terenkripsi di perangkat ini.</Text>
      <ErrorText message={error} />
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <Button label="Daftar" onPress={onSubmit} loading={loading} />
      <Link href="/login" style={styles.link}>
        Sudah punya akun? Masuk
      </Link>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 32, marginBottom: 24, fontSize: 28, fontWeight: '800', color: colors.text },
  note: { marginTop: -4, marginBottom: 12, fontSize: 12, color: colors.textMuted },
  info: { marginBottom: 12, color: colors.primary },
  link: { marginTop: 16, padding: 12, textAlign: 'center', color: colors.primary, fontWeight: '600' },
});
