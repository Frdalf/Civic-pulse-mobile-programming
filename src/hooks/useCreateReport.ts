// Milik Orang 1 — logika form lapor (screen app/(tabs)/create.tsx tetap tipis).
import { useCallback, useState } from 'react';

import { useLocationTracking } from '@/hooks/useLocationTracking';
import { capturePhoto } from '@/services/camera';
import { offlineQueue } from '@/services/offlineQueue';
import { insertReport, uploadReportPhoto } from '@/services/reports';
import { applyWatermark } from '@/services/watermark';
import { useAuthStore, useNetworkStore, useReportStore } from '@/store';
import type { Coordinate, ReportCategory } from '@/types';

const MIN_DESCRIPTION = 10;

function toMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export interface UseCreateReport {
  category: ReportCategory | null;
  description: string;
  photoUri: string | null;
  location: Coordinate | null;
  locationError: string | null;
  isCapturing: boolean;
  isSubmitting: boolean;
  error: string | null;
  setCategory(c: ReportCategory): void;
  setDescription(d: string): void;
  takePhoto(): Promise<void>;
  /** @returns true jika laporan berhasil terkirim. */
  submit(): Promise<boolean>;
}

export function useCreateReport(): UseCreateReport {
  const { location, error: locationError } = useLocationTracking();
  const user = useAuthStore((s) => s.user);
  const upsertReport = useReportStore((s) => s.upsertReport);

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = useCallback(async () => {
    if (!location) {
      setError('Lokasi belum didapat. Tunggu sebentar lalu coba lagi.');
      return;
    }
    setError(null);
    setIsCapturing(true);
    try {
      const raw = await capturePhoto();
      if (!raw) return; // dibatalkan atau izin ditolak
      setPhotoUri(await applyWatermark(raw, location, new Date()));
    } catch (e) {
      setError(toMessage(e, 'Gagal mengambil foto.'));
    } finally {
      setIsCapturing(false);
    }
  }, [location]);

  const submit = useCallback(async () => {
    if (!user) return fail('Anda harus masuk terlebih dulu.');
    if (!category) return fail('Pilih kategori laporan.');
    if (description.trim().length < MIN_DESCRIPTION)
      return fail(`Deskripsi minimal ${MIN_DESCRIPTION} karakter.`);
    if (!location) return fail('Lokasi belum didapat. Pastikan izin lokasi aktif.');

    setError(null);
    setIsSubmitting(true);
    try {
      if (!useNetworkStore.getState().isOnline) {
        await offlineQueue.enqueue({
          userId: user.id,
          category,
          description: description.trim(),
          location,
          photoUrl: photoUri,
        });
        setCategory(null);
        setDescription('');
        setPhotoUri(null);
        return true;
      }

      const photoUrl = photoUri ? await uploadReportPhoto(photoUri, user.id) : null;
      const report = await insertReport(
        { userId: user.id, category, description: description.trim(), location },
        photoUrl,
      );
      upsertReport(report);
      setCategory(null);
      setDescription('');
      setPhotoUri(null);
      return true;
    } catch (e) {
      // Saat gagal karena jaringan atau offline, simpan ke offlineQueue
      try {
        await offlineQueue.enqueue({
          userId: user.id,
          category,
          description: description.trim(),
          location,
          photoUrl: photoUri,
        });
        setCategory(null);
        setDescription('');
        setPhotoUri(null);
        return true;
      } catch {
        return fail(toMessage(e, 'Gagal mengirim laporan.'));
      }
    } finally {
      setIsSubmitting(false);
    }

    function fail(msg: string): false {
      setError(msg);
      return false;
    }
  }, [user, category, description, location, photoUri, upsertReport]);

  return {
    category,
    description,
    photoUri,
    location,
    locationError,
    isCapturing,
    isSubmitting,
    error,
    setCategory,
    setDescription,
    takePhoto,
    submit,
  };
}
