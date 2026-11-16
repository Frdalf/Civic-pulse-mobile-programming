import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import type { Coordinate } from '@/types';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface UseLocationTrackingResult {
  location: Coordinate | null;
  error: string | null;
  permission: LocationPermissionStatus;
}

interface AdaptiveIntervalConfig {
  distanceInterval: number; // meter
  timeInterval: number;     // milidetik
}

/**
 * Konfigurasi interval adaptif berdasarkan kecepatan (m/s):
 * - Diam / stationary (< 1.5 m/s ~ 5.4 km/h): perbarui tiap 5 meter
 * - Berjalan / walking (1.5 - 8 m/s ~ 5.4 - 28.8 km/h): perbarui tiap 20 meter
 * - Berkendara / vehicle (>= 8 m/s): perbarui tiap 50 meter
 */
function getIntervalConfig(speed: number | null): { tier: number; config: AdaptiveIntervalConfig } {
  if (speed !== null && speed >= 8) {
    return {
      tier: 2,
      config: { distanceInterval: 50, timeInterval: 2000 },
    };
  }

  if (speed !== null && speed > 1.5) {
    return {
      tier: 1,
      config: { distanceInterval: 20, timeInterval: 3000 },
    };
  }

  return {
    tier: 0,
    config: { distanceInterval: 5, timeInterval: 5000 },
  };
}

/**
 * Hook pelacakan lokasi real-time dengan interval adaptif (Orang 2 — Milestone P9).
 *
 * Menggunakan `Location.watchPositionAsync` dengan pembersihan (`remove()`)
 * wajib saat unmount untuk mencegah memory leak.
 */
export function useLocationTracking(): UseLocationTrackingResult {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<LocationPermissionStatus>('undetermined');

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const currentTierRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const locationRef = useRef<Coordinate | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    async function startTracking(tier = 0) {
      try {
        // Hentikan subscription sebelumnya jika ada penyesuaian interval
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }

        const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = currentStatus;

        if (finalStatus !== Location.PermissionStatus.GRANTED) {
          const { status: requestedStatus } = await Location.requestForegroundPermissionsAsync();
          finalStatus = requestedStatus;
        }

        if (!isMountedRef.current) return;

        if (finalStatus !== Location.PermissionStatus.GRANTED) {
          setPermission('denied');
          setError('Izin lokasi ditolak. Aktifkan izin lokasi untuk melihat jarak ke laporan.');
          return;
        }

        setPermission('granted');
        setError(null);

        // Ambil lokasi awal sekali secara cepat
        try {
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown && isMountedRef.current && !locationRef.current) {
            const initialCoord = {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            };
            locationRef.current = initialCoord;
            setLocation(initialCoord);
          }
        } catch {
          // Abaikan error lastKnown fallback
        }

        const interval =
          tier === 2
            ? { distanceInterval: 50, timeInterval: 2000 }
            : tier === 1
            ? { distanceInterval: 20, timeInterval: 3000 }
            : { distanceInterval: 5, timeInterval: 5000 };

        currentTierRef.current = tier;

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: interval.distanceInterval,
            timeInterval: interval.timeInterval,
          },
          (loc) => {
            if (!isMountedRef.current) return;

            const nextCoord = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            locationRef.current = nextCoord;
            setLocation(nextCoord);

            // Evaluasi perubahan kecepatan untuk penyesuaian interval adaptif
            const { tier: nextTier } = getIntervalConfig(loc.coords.speed);
            if (nextTier !== currentTierRef.current) {
              startTracking(nextTier);
            }
          }
        );

        if (isMountedRef.current) {
          subscriptionRef.current = sub;
        } else {
          sub.remove();
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        const msg = err instanceof Error ? err.message : 'Gagal melacak lokasi perangkat.';
        setError(msg);
      }
    }

    startTracking(0);

    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return { location, error, permission };
}
