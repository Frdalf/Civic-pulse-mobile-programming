import type { Coordinate } from '@/types';

/** Radius bumi rata-rata dalam kilometer. */
const EARTH_RADIUS_KM = 6371;

/** Konversi derajat ke radian. */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Menghitung jarak lingkaran besar (great-circle distance) antara dua koordinat
 * menggunakan formula Haversine.
 *
 * @param a Koordinat titik pertama
 * @param b Koordinat titik kedua
 * @returns Jarak dalam kilometer (km)
 */
export function haversineKm(a: Coordinate, b: Coordinate): number {
  if (a.latitude === b.latitude && a.longitude === b.longitude) {
    return 0;
  }

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLon = Math.sin(dLon / 2);

  const val =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLon * sinHalfDLon;

  // Penjagaan nilai domain acos / asin / sqrt karena presisi floating point
  const c = 2 * Math.atan2(Math.sqrt(val), Math.sqrt(Math.max(0, 1 - val)));

  return EARTH_RADIUS_KM * c;
}

/**
 * Format jarak numerik (km) menjadi teks yang ramah pengguna.
 * Contoh: 0.45 km -> "450 m", 2.34 km -> "2.3 km".
 */
export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || isNaN(km)) {
    return '-';
  }

  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }

  return `${km.toFixed(1)} km`;
}
