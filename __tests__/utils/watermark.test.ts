import {
  formatWatermarkCoordinates,
  formatWatermarkDate,
  formatWatermarkText,
} from '@/utils/watermark';
import type { Coordinate } from '@/types';

describe('watermark utils', () => {
  const sampleCoord: Coordinate = {
    latitude: -7.9666,
    longitude: 112.6326,
  };

  describe('formatWatermarkCoordinates', () => {
    it('memformat koordinat dengan presisi 6 desimal', () => {
      const formatted = formatWatermarkCoordinates(sampleCoord);
      expect(formatted).toBe('-7.966600, 112.632600');
    });

    it('menangani koordinat nol', () => {
      const zero: Coordinate = { latitude: 0, longitude: 0 };
      expect(formatWatermarkCoordinates(zero)).toBe('0.000000, 0.000000');
    });
  });

  describe('formatWatermarkDate', () => {
    it('memformat tanggal ke zona waktu WIB (UTC+7) dengan akhiran WIB', () => {
      // 2026-11-21 13:15:00 UTC = 2026-11-21 20:15:00 WIB
      const utcDate = new Date('2026-11-21T13:15:00.000Z');
      const formatted = formatWatermarkDate(utcDate);
      expect(formatted).toBe('21 Nov 2026 20:15 WIB');
    });

    it('memformat tanggal pergantian hari UTC ke WIB', () => {
      // 2026-11-21 18:30:00 UTC = 2026-11-22 01:30:00 WIB
      const utcDate = new Date('2026-11-21T18:30:00.000Z');
      const formatted = formatWatermarkDate(utcDate);
      expect(formatted).toBe('22 Nov 2026 01:30 WIB');
    });
  });

  describe('formatWatermarkText', () => {
    it('menggabungkan koordinat dan tanggal WIB dalam format dua baris', () => {
      const utcDate = new Date('2026-11-21T13:15:00.000Z');
      const result = formatWatermarkText(sampleCoord, utcDate);
      const lines = result.split('\n');

      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('-7.966600, 112.632600');
      expect(lines[1]).toBe('21 Nov 2026 20:15 WIB');
    });
  });
});
