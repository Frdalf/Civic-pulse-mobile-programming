import { formatDistance, haversineKm } from '@/utils/haversine';
import type { Coordinate } from '@/types';

describe('haversineKm', () => {
  it('mengembalikan 0 jika kedua koordinat identik', () => {
    const loc: Coordinate = { latitude: -7.9666, longitude: 112.6326 };
    expect(haversineKm(loc, loc)).toBe(0);
  });

  it('menghitung jarak antara dua titik di Malang secara akurat', () => {
    // Alun-Alun Malang ke Stasiun Malang Kotabaru (~0.95 km)
    const alunAlun: Coordinate = { latitude: -7.9826, longitude: 112.6308 };
    const stasiunMalang: Coordinate = { latitude: -7.9772, longitude: 112.6375 };

    const distance = haversineKm(alunAlun, stasiunMalang);
    // Jarak riil sekitar 0.95 km, toleransi +/- 0.1 km
    expect(distance).toBeGreaterThan(0.85);
    expect(distance).toBeLessThan(1.05);
  });

  it('memiliki sifat komutatif (jarak a->b sama dengan b->a)', () => {
    const a: Coordinate = { latitude: -7.9666, longitude: 112.6326 };
    const b: Coordinate = { latitude: -7.9400, longitude: 112.6150 };

    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

describe('formatDistance', () => {
  it('memformat jarak di bawah 1 km menjadi satuan meter', () => {
    expect(formatDistance(0.35)).toBe('350 m');
    expect(formatDistance(0.05)).toBe('50 m');
  });

  it('memformat jarak 1 km ke atas menjadi satu desimal km', () => {
    expect(formatDistance(1.234)).toBe('1.2 km');
    expect(formatDistance(15.67)).toBe('15.7 km');
  });

  it('menangani input null atau undefined', () => {
    expect(formatDistance(null)).toBe('-');
    expect(formatDistance(undefined)).toBe('-');
  });
});
