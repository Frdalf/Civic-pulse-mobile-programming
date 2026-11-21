import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { useNetworkStore } from '@/store';

/**
 * Banner "Offline" global di atas konten. Saat tampil, inset atas untuk children
 * di-set 0 supaya layar di bawahnya tidak menambah jarak status bar dua kali.
 * Status online diisi oleh useNetworkStatus (Orang 2).
 */
function OfflineBannerBase({ children }: { children: ReactNode }) {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const insets = useSafeAreaInsets();

  if (isOnline) return <>{children}</>;
  return (
    <View style={styles.root}>
      <View
        style={[styles.banner, { paddingTop: insets.top + 6 }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.text}>Offline — laporan baru dikirim saat koneksi kembali.</Text>
      </View>
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

export const OfflineBanner = memo(OfflineBannerBase);

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: { backgroundColor: colors.warning, paddingBottom: 6, paddingHorizontal: 16 },
  text: { color: '#1B1F1D', fontWeight: '600', textAlign: 'center', fontSize: 13 },
});
