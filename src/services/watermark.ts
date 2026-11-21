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
    Image.getSize(
      uri,
      (origWidth, origHeight) => {
        // Batasi resolusi maksimal canvas agar proses snapshot cepat dan hemat RAM
        const maxDim = 1280;
        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (origWidth > maxDim || origHeight > maxDim) {
          if (origWidth > origHeight) {
            targetWidth = maxDim;
            targetHeight = Math.round((origHeight / origWidth) * maxDim);
          } else {
            targetHeight = maxDim;
            targetWidth = Math.round((origWidth / origHeight) * maxDim);
          }
        }

        const job: WatermarkJob = {
          uri,
          loc,
          date,
          width: targetWidth,
          height: targetHeight,
          resolve,
          reject,
        };

        currentJob = job;
        activeHandler?.(job);

        // Timeout pengaman 3.5 detik jika snapshot native terhambat
        setTimeout(() => {
          if (currentJob === job) {
            currentJob = null;
            activeHandler?.(null);
            resolve(uri);
          }
        }, 3500);
      },
      (sizeError) => {
        console.warn('[Watermark] Gagal membaca ukuran foto:', sizeError);
        const job: WatermarkJob = {
          uri,
          loc,
          date,
          width: 960,
          height: 1280,
          resolve,
          reject,
        };

        currentJob = job;
        activeHandler?.(job);

        setTimeout(() => {
          if (currentJob === job) {
            currentJob = null;
            activeHandler?.(null);
            resolve(uri);
          }
        }, 3500);
      }
    );
  });
}
