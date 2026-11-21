import { File, Paths } from 'expo-file-system';

import { insertReport, uploadReportPhoto } from '@/services/reports';
import { isSupabaseConfigured } from '@/services/supabase';
import { useNetworkStore, useReportStore } from '@/store';
import type { Report } from '@/types';

export type QueuedReportInput = Omit<Report, 'id' | 'status' | 'createdAt'>;

function getQueueFile(): File {
  return new File(Paths.document, 'offline_reports_queue.json');
}

async function readQueue(): Promise<Report[]> {
  try {
    const file = getQueueFile();
    if (!file.exists) return [];
    const text = await file.text();
    return JSON.parse(text) as Report[];
  } catch (error) {
    console.warn('[OfflineQueue] Gagal membaca antrean:', error);
    return [];
  }
}

async function writeQueue(queue: Report[]): Promise<void> {
  try {
    const file = getQueueFile();
    await file.write(JSON.stringify(queue));
  } catch (error) {
    console.warn('[OfflineQueue] Gagal menyimpan antrean:', error);
  }
}

let isFlushing = false;

/**
 * Layanan antrean laporan offline berbasis File System (Orang 2 — Minggu 3).
 * Menyimpan laporan saat tidak ada koneksi internet ke dokumen lokal,
 * dan melakukan sinkronisasi otomatis (`flush`) ketika jaringan kembali online.
 */
export const offlineQueue = {
  /**
   * Menambahkan laporan ke antrean offline dan memperbarui store lokal dengan flag `pendingSync: true`.
   */
  async enqueue(input: QueuedReportInput): Promise<void> {
    const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const queuedReport: Report = {
      ...input,
      id: tempId,
      status: 'baru',
      createdAt: new Date().toISOString(),
      pendingSync: true,
    };

    const current = await readQueue();
    current.push(queuedReport);
    await writeQueue(current);

    // Tampilkan langsung di antarmuka dengan tanda pending
    useReportStore.getState().upsertReport(queuedReport);
  },

  /**
   * Mengirim seluruh laporan tertunda di antrean ke Supabase.
   */
  async flush(): Promise<void> {
    if (isFlushing || !isSupabaseConfigured || !useNetworkStore.getState().isOnline) {
      return;
    }

    isFlushing = true;
    try {
      const queue = await readQueue();
      if (queue.length === 0) return;

      const remaining: Report[] = [];

      for (const item of queue) {
        try {
          let photoUrl = item.photoUrl;

          // Jika foto masih berupa URI lokal, unggah ke storage terlebih dulu
          if (photoUrl && (photoUrl.startsWith('file://') || !photoUrl.startsWith('http'))) {
            photoUrl = await uploadReportPhoto(photoUrl, item.userId);
          }

          const savedReport = await insertReport(
            {
              userId: item.userId,
              category: item.category,
              description: item.description,
              location: item.location,
            },
            photoUrl
          );

          // Ganti laporan sementara di store dengan data server resmi
          useReportStore.getState().replaceReport(item.id, savedReport);
        } catch (itemError) {
          console.warn(`[OfflineQueue] Gagal sinkronisasi laporan ${item.id}:`, itemError);
          remaining.push(item);
        }
      }

      await writeQueue(remaining);
    } finally {
      isFlushing = false;
    }
  },
};
