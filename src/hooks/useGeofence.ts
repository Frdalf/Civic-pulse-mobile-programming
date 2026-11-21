import { useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';

import { useZoneStore } from '@/store';
import type { Coordinate, DisasterZone } from '@/types';
import { isInsideZone } from '@/utils/geofence';

export interface UseGeofenceResult {
  insideZones: DisasterZone[];
}

/**
 * Hook pemantauan geofencing zona rawan bencana (Orang 2 — Minggu 3).
 * Mengidentifikasi zona yang dimasuki pengguna secara real-time dan
 * menampilkan peringatan notifikasi lokal sekali per masuk (bukan berulang).
 *
 * Sesuai kontrak §5.3:
 * `useGeofence(zones: DisasterZone[], location: Coordinate | null): { insideZones: DisasterZone[] }`
 */
export function useGeofence(
  zones: DisasterZone[],
  location: Coordinate | null
): UseGeofenceResult {
  const previouslyInsideRef = useRef<Set<string>>(new Set());
  const setActiveZones = useZoneStore((s) => s.setActiveZones);

  // Hitung zona aktif secara deklaratif dengan useMemo (mencegah cascading re-render)
  const insideZones = useMemo(() => {
    if (!location || zones.length === 0) return [];
    return zones.filter((z) => isInsideZone(location, z));
  }, [location, zones]);

  useEffect(() => {
    const insideIds = insideZones.map((z) => z.id);
    const insideIdSet = new Set(insideIds);

    // Picu peringatan notifikasi lokal hanya untuk zona yang baru saja dimasuki
    insideZones.forEach((zone) => {
      if (!previouslyInsideRef.current.has(zone.id)) {
        Alert.alert(
          '⚠️ Peringatan Zona Rawan Bencana',
          `Anda telah memasuki ${zone.name} (${zone.type.toUpperCase()}). Tingkat risiko: ${zone.riskLevel.toUpperCase()}. Harap berhati-hati dan waspada!`
        );
      }
    });

    previouslyInsideRef.current = insideIdSet;
    setActiveZones(insideIds);
  }, [insideZones, setActiveZones]);

  return { insideZones };
}
