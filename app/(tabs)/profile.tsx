import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorText } from '@/components/ui/ErrorText';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const email = useAuthStore((s) => s.user?.email ?? '');
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout(); // auth gate otomatis kembali ke login
    } catch (e) {
      // Sesi lokal tetap dihapus; ini hanya memberi tahu bila server tidak terjangkau.
      setError(e instanceof Error ? e.message : 'Gagal keluar dari server.');
      setLoading(false);
    }
  };

  return (
    <ScreenPlaceholder title="Profil" description={email}>
      <View style={styles.body}>
        <ErrorText message={error} />
        <Button label="Keluar" variant="danger" onPress={onLogout} loading={loading} />
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
});
