import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { colors } from '@/constants/colors';
import { useReportStore } from '@/store';

// Ikon emoji dipakai agar tidak menambah library ikon (lihat §2).
function icon(glyph: string) {
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>;
  }
  return TabIcon;
}

export default function TabLayout() {
  const loadReports = useReportStore((s) => s.loadReports);

  useEffect(() => {
    // Muat laporan sekali setelah login. Tidak ada subscription → tanpa cleanup.
    // loadReports tidak pernah reject; error disimpan di store & ditampilkan di layar Laporan.
    void loadReports();
  }, [loadReports]);

  return (
    <OfflineBanner>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tabs.Screen name="map" options={{ title: 'Peta', tabBarIcon: icon('🗺️') }} />
        <Tabs.Screen name="reports" options={{ title: 'Laporan', tabBarIcon: icon('📋') }} />
        <Tabs.Screen name="create" options={{ title: 'Lapor', tabBarIcon: icon('➕') }} />
        <Tabs.Screen name="vault" options={{ title: 'Vault', tabBarIcon: icon('🗂️') }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('👤') }} />
      </Tabs>
    </OfflineBanner>
  );
}
