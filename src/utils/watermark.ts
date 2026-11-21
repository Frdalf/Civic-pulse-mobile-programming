import type { Coordinate } from '@/types';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * Format koordinat menjadi teks desimal 6 angka di belakang koma (standar akurasi GPS ~0.1 meter).
 * Contoh: "-7.966600, 112.632600"
 */
export function formatWatermarkCoordinates(loc: Coordinate): string {
  return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
}

/**
 * Format tanggal dalam zona waktu WIB (Asia/Jakarta, UTC+7) dengan format `dd MMM yyyy HH:mm WIB`.
 * Contoh: "21 Nov 2026 20:15 WIB"
 */
export function formatWatermarkDate(date: Date): string {
  // Hitung offset UTC+7 secara eksplisit agar konsisten di semua lingkungan (termasuk CI/Jest)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 7 * 3600000);

  const day = String(wibTime.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[wibTime.getMonth()] ?? '';
  const year = wibTime.getFullYear();
  const hours = String(wibTime.getHours()).padStart(2, '0');
  const minutes = String(wibTime.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes} WIB`;
}

/**
 * Gabungan teks watermark dua baris: koordinat dan waktu WIB.
 * Contoh:
 * -7.966600, 112.632600
 * 21 Nov 2026 20:15 WIB
 */
export function formatWatermarkText(loc: Coordinate, date: Date): string {
  return `${formatWatermarkCoordinates(loc)}\n${formatWatermarkDate(date)}`;
}
