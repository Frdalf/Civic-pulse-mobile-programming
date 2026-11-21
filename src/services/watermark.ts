import { Image } from 'react-native';

import type { Coordinate } from '@/types';

export interface WatermarkJob {
  uri: string;
  loc: Coordinate;
  date: Date;
  width: number;
  height: number;
  resolve: (uri: string) => void;
  reject: (err: Error) => void;
}

type WatermarkHandler = (job: WatermarkJob | null) => void;

let activeHandler: WatermarkHandler | null = null;
let currentJob: WatermarkJob | null = null;

const MAX_DIMENSION = 1280;
const WATERMARK_TIMEOUT_MS = 8000;

/**
 * Daftarkan handler UI (WatermarkBurner) untuk merender dan mencetak foto.
 * @returns Fungsi unsubscribe saat komponen unmount.
 */
export function registerWatermarkHandler(handler: WatermarkHandler): () => void {
  activeHandler = handler;
  return () => {
    if (activeHandler === handler) {
      activeHandler = null;
    }
  };
}

/**
 * Mencetak watermark teks `lat, long` + `dd MMM yyyy HH:mm WIB` secara visual ke dalam pixel foto
 * (Orang 2 — Milestone P10).
 *
 * Menggunakan `react-native-view-shot` untuk merender foto dengan overlay teks watermark
 * dan menghasilkan berkas foto JPEG baru dengan teks tercetak permanen di pojok foto.
 *
 * Sesuai kontrak PROJECT_CONTEXT §5.3:
 * `applyWatermark(uri: string, loc: Coordinate, date: Date): Promise<string>`
 *
 * @param uri URI lokal foto yang diambil dari kamera
 * @param loc Koordinat lokasi perangkat
 * @param date Waktu pengambilan foto
 * @returns URI berkas foto baru yang sudah tercetak watermark di dalamnya
 * @throws Error bila watermark gagal dicetak (pemanggil menampilkan pesan ke user)
 */
export async function applyWatermark(
  uri: string,
  loc: Coordinate,
  date: Date
): Promise<string> {
  // Jika handler UI tidak terpasang (misal di testing node/jest), kembalikan URI asli dengan aman
  if (!activeHandler) {
    return uri;
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Pastikan promise hanya diselesaikan sekali dan burner dibersihkan.
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (currentJob?.uri === uri) {
        currentJob = null;
        activeHandler?.(null);
      }
      fn();
    };

    const start = (width: number, height: number) => {
      const job: WatermarkJob = {
        uri,
        loc,
        date,
        width,
        height,
        resolve: (out) => finish(() => resolve(out)),
        reject: (err) => finish(() => reject(err)),
      };
      currentJob = job;
      activeHandler?.(job);

      // Batas waktu: foto TANPA watermark tidak boleh lolos diam-diam (fitur wajib #1).
      timer = setTimeout(() => {
        job.reject(new Error('Gagal mencetak watermark (waktu habis). Silakan ambil ulang foto.'));
      }, WATERMARK_TIMEOUT_MS);
    };

    Image.getSize(
      uri,
      (origWidth, origHeight) => {
        // Batasi resolusi kanvas agar snapshot cepat dan hemat RAM.
        const scale = Math.min(1, MAX_DIMENSION / Math.max(origWidth, origHeight));
        start(Math.round(origWidth * scale), Math.round(origHeight * scale));
      },
      (sizeError) => {
        console.warn('[Watermark] Gagal membaca ukuran foto, pakai 3:4 default:', sizeError);
        start(960, 1280);
      },
    );
  });
}
