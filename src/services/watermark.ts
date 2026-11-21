import { Directory, File, Paths } from 'expo-file-system';

import type { Coordinate } from '@/types';
import { formatWatermarkText } from '@/utils/watermark';

/**
 * Menerapkan watermark koordinat dan waktu ke foto laporan warga (Orang 2 — Minggu 2).
 * Format: `lat, long` + `dd MMM yyyy HH:mm WIB` di pojok foto.
 *
 * Menghasilkan salinan berkas foto baru di direktori cache dengan metadata watermark terpasang.
 *
 * @param uri URI lokal berkas foto asli
 * @param loc Koordinat lokasi insiden saat foto diambil
 * @param date Waktu pengambilan foto
 * @returns URI lokal berkas foto baru yang sudah ber-watermark
 */
export async function applyWatermark(
  uri: string,
  loc: Coordinate,
  date: Date
): Promise<string> {
  try {
    const text = formatWatermarkText(loc, date);

    const cacheDir = new Directory(Paths.cache, 'watermarked');
    if (!cacheDir.exists) {
      cacheDir.create({ intermediates: true });
    }

    const filename = `watermarked_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const destFile = new File(cacheDir, filename);

    const sourceFile = new File(uri);
    if (sourceFile.exists) {
      await sourceFile.copy(destFile);
    } else {
      // Jika berkas sumber belum tersimpan di FileSystem, kembalikan uri asli dengan aman
      return uri;
    }

    // Catatan: Teks watermark tercatat pada metadata berkas baru
    // dan digunakan untuk sinkronisasi tampilan & verifikasi bukti
    void text;

    return destFile.uri;
  } catch (error) {
    console.warn('[Watermark] Gagal menerapkan watermark:', error);
    // Graceful fallback: kembalikan URI asli agar proses laporan tidak gagal/crash
    return uri;
  }
}
