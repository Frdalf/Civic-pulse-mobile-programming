import { Directory, File, Paths } from 'expo-file-system';

import { insertReport, uploadReportPhoto } from '@/services/reports';
import { isSupabaseConfigured } from '@/services/supabase';
import { useNetworkStore, useReportStore } from '@/store';
import type { Report } from '@/types';

export type QueuedReportInput = Omit<Report, 'id' | 'status' | 'createdAt'>;

function getQueueFile(): File {
  return new File(Paths.document, 'offline_reports_queue.json');
}

/** Foto antrean disimpan di documentDirectory (cache bisa dihapus OS sebelum flush). */
function getPhotoDir(): Directory {
  const dir = new Directory(Paths.document, 'offline_photos');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function isLocalUri(uri: string): boolean {
  return !uri.startsWith('http://') && !uri.startsWith('https://');
}

async function readQueue(): Promise<Report[]> {
  try {
    const file = getQueueFile();
    if (!file.exists) return [];
    const parsed: unknown = JSON.parse(await file.text());
    return Array.isArray(parsed) ? (parsed as Report[]) : [];
  } catch (error) {
    console.warn('[OfflineQueue] Gagal membaca antrean:', error);
    return [];
  }
}

/** @throws bila gagal menulis — pemanggil wajib menangani (tidak boleh diam-diam hilang). */
async function writeQueue(queue: Report[]): Promise<void> {
  const file = getQueueFile();
  if (!file.exists) file.create();
  await file.write(JSON.stringify(queue));
}

function deleteLocalPhoto(uri: string | null): void {
  if (!uri || !isLocalUri(uri)) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // File sementara; gagal hapus tidak memengaruhi data.
  }
}

let isFlushing = false;

/**
 * Antrean laporan offline berbasis File System (Orang 2 — Minggu 3).
 * Laporan disimpan ke dokumen lokal saat offline dan dikirim (`flush`) saat online kembali.
 */
export const offlineQueue = {
  /** Simpan laporan ke antrean + tampilkan di store dengan `pendingSync: true`. */
  async enqueue(input: QueuedReportInput): Promise<void> {
    const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let photoUrl = input.photoUrl;
    if (photoUrl && isLocalUri(photoUrl)) {
      const dest = new File(getPhotoDir(), `${tempId}.jpg`);
      await new File(photoUrl).copy(dest);
      photoUrl = dest.uri;
    }

    const queuedReport: Report = {
      ...input,
      photoUrl,
      id: tempId,
      status: 'baru',
      createdAt: new Date().toISOString(),
      pendingSync: true,
    };

    const current = await readQueue();
    await writeQueue([...current, queuedReport]);
    useReportStore.getState().upsertReport(queuedReport);
  },

  /** Muat antrean yang tersimpan ke store (dipanggil saat app dibuka). */
  async load(): Promise<void> {
    const queue = await readQueue();
    const { upsertReport } = useReportStore.getState();
    queue.forEach((r) => upsertReport({ ...r, pendingSync: true }));
  },

  /** Kirim seluruh laporan tertunda ke Supabase. */
  async flush(): Promise<void> {
    if (isFlushing || !isSupabaseConfigured || !useNetworkStore.getState().isOnline) return;

    isFlushing = true;
    try {
      const queue = await readQueue();
      if (queue.length === 0) return;

      const remaining: Report[] = [];
      for (const item of queue) {
        const localPhoto = item.photoUrl && isLocalUri(item.photoUrl) ? item.photoUrl : null;
        try {
          let photoUrl = item.photoUrl;
          if (localPhoto) {
            photoUrl = await uploadReportPhoto(localPhoto, item.userId);
            // Simpan URL hasil upload agar retry berikutnya tidak meng-upload ulang,
            // lalu hapus salinan lokal yang sudah tidak diperlukan.
            item.photoUrl = photoUrl;
            deleteLocalPhoto(localPhoto);
          }
          const saved = await insertReport(
            {
              userId: item.userId,
              category: item.category,
              description: item.description,
              location: item.location,
            },
            photoUrl,
          );
          useReportStore.getState().replaceReport(item.id, saved);
        } catch (itemError) {
          console.warn(`[OfflineQueue] Gagal sinkronisasi laporan ${item.id}:`, itemError);
          remaining.push(item);
        }
      }
      await writeQueue(remaining);
    } catch (error) {
      console.warn('[OfflineQueue] Gagal menyimpan sisa antrean:', error);
    } finally {
      isFlushing = false;
    }
  },
};
