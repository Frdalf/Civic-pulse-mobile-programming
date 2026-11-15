import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store';

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    // Tidak membuat subscription → tidak perlu cleanup.
    hydrate().catch(() => {
      // TODO(Orang 1, Minggu 2): tampilkan error hydrate ke user.
    });
  }, [hydrate]);

  // TODO(Orang 1, Minggu 2): auth gate — arahkan ke (auth)/login bila user null.
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="report/[id]" options={{ title: 'Detail Laporan' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
