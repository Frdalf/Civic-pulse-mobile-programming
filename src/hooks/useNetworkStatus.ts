import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { offlineQueue } from '@/services/offlineQueue';
import { useNetworkStore } from '@/store';

/**
 * Hook pemantauan status koneksi internet reaktif (Orang 2 — Minggu 3).
 * Mengintegrasikan NetInfo dengan useNetworkStore dan otomatis
 * memicu sinkronisasi antrean offline (`flush`) ketika koneksi kembali online.
 *
 * Cleanup: menghapus listener NetInfo saat unmount (Zero Memory Leak).
 */
export function useNetworkStatus(): boolean {
  const storeOnline = useNetworkStore((s) => s.isOnline);
  const setOnline = useNetworkStore((s) => s.setOnline);
  const [isOnline, setIsOnlineLocal] = useState<boolean>(storeOnline);
  const wasOfflineRef = useRef<boolean>(!storeOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(
        state.isConnected && (state.isInternetReachable === null || state.isInternetReachable)
      );

      setIsOnlineLocal(online);
      setOnline(online);

      // Jika sebelumnya offline dan sekarang online kembali, lakukan sinkronisasi antrean
      if (wasOfflineRef.current && online) {
        offlineQueue.flush().catch((err) => {
          console.warn('[useNetworkStatus] Gagal auto-flush offlineQueue:', err);
        });
      }

      wasOfflineRef.current = !online;
    });

    return () => {
      unsubscribe();
    };
  }, [setOnline]);

  return isOnline;
}
