import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { subscribeTokenRefresh } from '@/services/auth';
import { isSupabaseConfigured } from '@/services/supabase';
import { useAuthStore } from '@/store';

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore((s) => s.user !== null);

  useEffect(() => {
    // hydrate() tidak pernah reject (lihat useAuthStore) — selalu set isHydrated.
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Cleanup: unsubscribe listener onAuthStateChange saat unmount.
    const unsubscribe = subscribeTokenRefresh();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {!isHydrated ? (
        <View style={styles.splash} accessibilityLabel="Memuat sesi">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth gate: route di bawah hanya bisa diakses sesuai status login. */}
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="report/[id]"
              options={{ headerShown: true, title: 'Detail Laporan' }}
            />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
