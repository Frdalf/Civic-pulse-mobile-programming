import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import {
  registerWatermarkHandler,
  type WatermarkJob,
} from '@/services/watermark';
import { formatWatermarkCoordinates, formatWatermarkDate } from '@/utils/watermark';

/**
 * Komponen tersembunyi (off-screen) untuk merender foto beserta teks watermark
 * dan mencetaknya secara permanen ke pixel berkas gambar menggunakan `react-native-view-shot`.
 *
 * Komponen ini dipasang di root layout (`app/_layout.tsx`).
 */
export function WatermarkBurner() {
  const [job, setJob] = useState<WatermarkJob | null>(null);
  const viewShotRef = useRef<ViewShotRef>(null);

  useEffect(() => {
    return registerWatermarkHandler((newJob) => {
      setJob(newJob);
    });
  }, []);

  const handleCapture = async () => {
    if (!job || !viewShotRef.current?.capture) return;

    try {
      // Jeda singkat agar teks watermark dan gambar selesai dilayout sempurna
      await new Promise((r) => setTimeout(r, 120));

      const snapshotUri = await viewShotRef.current.capture();

      job.resolve(snapshotUri);
    } catch (error) {
      console.warn('[WatermarkBurner] Gagal melakukan snapshot foto:', error);
      job.reject(new Error('Gagal mencetak watermark. Silakan ambil ulang foto.'));
    } finally {
      setJob(null);
    }
  };

  if (!job) return null;

  const coordText = formatWatermarkCoordinates(job.loc);
  const dateText = formatWatermarkDate(job.date);

  return (
    <View style={styles.offscreenContainer} pointerEvents="none">
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'jpg',
          quality: 0.9,
          result: 'tmpfile',
        }}
        style={[
          styles.captureCanvas,
          { width: job.width, height: job.height },
        ]}
      >
        <Image
          source={{ uri: job.uri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => {
            void handleCapture();
          }}
          onError={() => {
            job.reject(new Error('Foto tidak dapat dibaca untuk diberi watermark.'));
            setJob(null);
          }}
        />

        {/* Badge Watermark Tercetak di Pojok Foto */}
        <View style={styles.watermarkBadge}>
          <Text style={styles.appTag}>CIVIC PULSE · BUKTI LAPORAN WARGA</Text>
          <Text style={styles.coordText}>📍 {coordText}</Text>
          <Text style={styles.dateText}>🕒 {dateText}</Text>
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  offscreenContainer: {
    // Di luar layar tapi TETAP dirender (tanpa opacity: 0) agar Android tidak
    // melewatkan proses gambar dan hasil snapshot tidak kosong.
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  captureCanvas: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  watermarkBadge: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0B6E4F',
    gap: 4,
  },
  appTag: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  coordText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  dateText: {
    color: '#ECEFF1',
    fontSize: 14,
    fontWeight: '600',
  },
});
