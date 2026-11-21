import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export type PermissionKind = 'camera' | 'location' | 'media';
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionExplanation {
  title: string;
  message: string;
  icon: string;
}

export interface UsePermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  isPermanentlyDenied: boolean;
  explanation: PermissionExplanation;
  request(): Promise<boolean>;
  openSettings(): Promise<void>;
}

const EXPLANATIONS: Record<PermissionKind, PermissionExplanation> = {
  camera: {
    title: 'Izin Kamera Dibutuhkan',
    message:
      'Civic Pulse membutuhkan akses kamera untuk mengambil foto bukti insiden atau kerusakan fasilitas umum secara langsung.',
    icon: '📷',
  },
  location: {
    title: 'Izin Lokasi Dibutuhkan',
    message:
      'Civic Pulse membutuhkan akses lokasi untuk mendeteksi posisi Anda saat melaporkan insiden dan memantau geofencing area rawan.',
    icon: '📍',
  },
  media: {
    title: 'Izin Galeri / Media Dibutuhkan',
    message:
      'Civic Pulse membutuhkan akses penyimpanan untuk memilih berkas dokumen atau foto dari perangkat Anda.',
    icon: '📁',
  },
};

/**
 * Hook manajemen perizinan runtime Just-In-Time (JIT) (Orang 2 — Minggu 2).
 * Menyediakan alur JIT, penjelasan kebutuhan izin, deteksi penolakan permanen,
 * dan tombol navigasi ke Pengaturan perangkat tanpa membuat aplikasi crash.
 *
 * Sesuai kontrak PROJECT_CONTEXT §5.3:
 * `usePermission(kind: 'camera'|'location'|'media'): { status; request(): Promise<boolean> }`
 */
export function usePermission(kind: PermissionKind): UsePermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function syncPermission() {
      try {
        if (kind === 'camera') {
          const res = await ImagePicker.getCameraPermissionsAsync();
          if (!isMounted) return;
          setStatus(
            res.status === ImagePicker.PermissionStatus.GRANTED
              ? 'granted'
              : res.status === ImagePicker.PermissionStatus.DENIED
              ? 'denied'
              : 'undetermined'
          );
          setCanAskAgain(res.canAskAgain);
        } else if (kind === 'location') {
          const res = await Location.getForegroundPermissionsAsync();
          if (!isMounted) return;
          setStatus(
            res.status === Location.PermissionStatus.GRANTED
              ? 'granted'
              : res.status === Location.PermissionStatus.DENIED
              ? 'denied'
              : 'undetermined'
          );
          setCanAskAgain(res.canAskAgain);
        } else if (kind === 'media') {
          const res = await ImagePicker.getMediaLibraryPermissionsAsync();
          if (!isMounted) return;
          setStatus(
            res.status === ImagePicker.PermissionStatus.GRANTED
              ? 'granted'
              : res.status === ImagePicker.PermissionStatus.DENIED
              ? 'denied'
              : 'undetermined'
          );
          setCanAskAgain(res.canAskAgain);
        }
      } catch (err) {
        console.warn(`[usePermission] Gagal memeriksa izin ${kind}:`, err);
        if (isMounted) setStatus('undetermined');
      }
    }

    void syncPermission();

    return () => {
      isMounted = false;
    };
  }, [kind]);

  const request = useCallback(async (): Promise<boolean> => {
    try {
      if (kind === 'camera') {
        const res = await ImagePicker.requestCameraPermissionsAsync();
        const granted = res.status === ImagePicker.PermissionStatus.GRANTED;
        setStatus(granted ? 'granted' : 'denied');
        setCanAskAgain(res.canAskAgain);
        return granted;
      } else if (kind === 'location') {
        const res = await Location.requestForegroundPermissionsAsync();
        const granted = res.status === Location.PermissionStatus.GRANTED;
        setStatus(granted ? 'granted' : 'denied');
        setCanAskAgain(res.canAskAgain);
        return granted;
      } else if (kind === 'media') {
        const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const granted = res.status === ImagePicker.PermissionStatus.GRANTED;
        setStatus(granted ? 'granted' : 'denied');
        setCanAskAgain(res.canAskAgain);
        return granted;
      }
      return false;
    } catch (err) {
      console.warn(`[usePermission] Gagal meminta izin ${kind}:`, err);
      return false;
    }
  }, [kind]);

  const openSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (err) {
      console.warn('[usePermission] Gagal membuka pengaturan sistem:', err);
    }
  }, []);

  return {
    status,
    canAskAgain,
    isPermanentlyDenied: status === 'denied' && !canAskAgain,
    explanation: EXPLANATIONS[kind],
    request,
    openSettings,
  };
}
