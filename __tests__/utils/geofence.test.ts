import { isInsideZone } from '@/utils/geofence';
import type { Coordinate, DisasterZone } from '@/types';

describe('geofence utils', () => {
  const sampleZone: DisasterZone = {
    id: 'zone-test',
    name: 'Zona Uji Coba Suhat',
    type: 'banjir',
    center: { latitude: -7.9431, longitude: 112.618 },
    radiusMeters: 500, // 0.5 km
    riskLevel: 'tinggi',
  };

  it('mengembalikan true jika koordinat tepat di titik pusat zona', () => {
    expect(isInsideZone(sampleZone.center, sampleZone)).toBe(true);
  });

  it('mengembalikan true jika titik berada di dalam radius zona', () => {
    // Titik yang berjarak ~100m dari pusat
    const insidePoint: Coordinate = {
      latitude: -7.9435,
      longitude: 112.6182,
    };
    expect(isInsideZone(insidePoint, sampleZone)).toBe(true);
  });

  it('mengembalikan false jika titik berada di luar radius zona', () => {
    // Titik di Alun-Alun Malang (~4.5 km dari Suhat)
    const outsidePoint: Coordinate = {
      latitude: -7.9826,
      longitude: 112.6308,
    };
    expect(isInsideZone(outsidePoint, sampleZone)).toBe(false);
  });
});
