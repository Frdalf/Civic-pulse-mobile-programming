import type { Coordinate, DisasterZone } from '@/types';
import { haversineKm } from '@/utils/haversine';

/**
 * Menentukan apakah suatu titik koordinat berada di dalam radius zona rawan bencana
 * berdasarkan jarak Haversine (Orang 2 — Minggu 3).
 *
 * @param p Koordinat posisi pengguna atau insiden
 * @param z Definisi zona bencana
 * @returns `true` jika berada di dalam atau pada batas radius zona
 */
export function isInsideZone(p: Coordinate, z: DisasterZone): boolean {
  const distanceKm = haversineKm(p, z.center);
  const distanceMeters = distanceKm * 1000;
  return distanceMeters <= z.radiusMeters;
}
