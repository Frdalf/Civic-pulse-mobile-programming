import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { colors } from '@/constants/colors';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { offlineQueue } from '@/services/offlineQueue';
import { useReportStore, useZoneStore } from '@/store';

// Ikon emoji dipakai agar tidak menambah library ikon (lihat §2).
function icon(glyph: string) {
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>;
  }
  return TabIcon;
}

export default function TabLayout() {
  const loadReports = useReportStore((s) => s.loadReports);
  const loadZones = useZoneStore((s) => s.loadZones);

  // Dipasang di sini (bukan di satu layar) agar aktif selama user login.
  // Cleanup: NetInfo unsubscribe & supabase.removeChannel ada di dalam masing-masing hook.
  useNetworkStatus();
  useRealtimeReports();

  useEffect(() => {
    // Muat data awal sekali setelah login. Tidak ada subscription → tanpa cleanup.
    // loadReports/loadZones tidak pernah reject; error disimpan di store.
    // Antrean offline dimuat SETELAH loadReports agar laporan pending tidak tertimpa,
    // lalu dicoba kirim (flush tidak berbuat apa-apa bila offline).
    void (async () => {
      await loadReports();
      try {
        await offlineQueue.load();
        await offlineQueue.flush();
      } catch (e) {
        console.warn('[TabLayout] Gagal memuat antrean offline:', e);
      }
    })();
    void loadZones();
  }, [loadReports, loadZones]);

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
