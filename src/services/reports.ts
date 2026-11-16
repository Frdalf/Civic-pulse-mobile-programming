import { File } from 'expo-file-system';

import { STORAGE_BUCKET_REPORT_PHOTOS } from '@/constants/config';
import type { Report } from '@/types';

import { getSupabase, toReport, toReportInsert, type DbReportRow } from './supabase';

export type NewReport = Pick<Report, 'userId' | 'category' | 'description' | 'location'>;

/**
 * Upload foto (sudah ber-watermark) ke bucket `report-photos`.
 * Path `<userId>/<timestamp>.jpg` sesuai policy storage (folder = auth.uid()).
 * @returns URL publik foto.
 */
export async function uploadReportPhoto(localUri: string, userId: string): Promise<string> {
  const bytes = await new File(localUri).arrayBuffer();
  const path = `${userId}/${Date.now()}.jpg`;
  const storage = getSupabase().storage.from(STORAGE_BUCKET_REPORT_PHOTOS);
  const { error } = await storage.upload(path, bytes, { contentType: 'image/jpeg' });
  if (error) throw new Error(`Gagal mengunggah foto: ${error.message}`);
  return storage.getPublicUrl(path).data.publicUrl;
}

/** Insert laporan ke tabel `reports` dan kembalikan hasil yang sudah dipetakan. */
export async function insertReport(r: NewReport, photoUrl: string | null): Promise<Report> {
  const { data, error } = await getSupabase()
    .from('reports')
    .insert(toReportInsert({ ...r, photoUrl }))
    .select()
    .single<DbReportRow>();
  if (error) throw new Error(`Gagal menyimpan laporan: ${error.message}`);
  return toReport(data);
}
