import type { DisasterZone } from '@/types';

/**
 * Daftar zona rawan bencana di Kota Malang (Orang 2 — Minggu 3).
 * Mencakup area banjir, longsor, dan gempa berdasarkan topografi Malang.
 */
export const MALANG_DISASTER_ZONES: DisasterZone[] = [
  {
    id: 'zone-1',
    name: 'Bantaran Sungai Brantas (Jodipan / Kampung Warna-Warni)',
    type: 'banjir',
    center: { latitude: -7.9839, longitude: 112.6378 },
    radiusMeters: 400,
    riskLevel: 'tinggi',
  },
  {
    id: 'zone-2',
    name: 'Kawasan Tebing Rajabasa (Klojen)',
    type: 'longsor',
    center: { latitude: -7.9712, longitude: 112.6285 },
    radiusMeters: 300,
    riskLevel: 'sedang',
  },
  {
    id: 'zone-3',
    name: 'Koridor Genangan Air Soekarno-Hatta (Suhat)',
    type: 'banjir',
    center: { latitude: -7.9431, longitude: 112.618 },
    radiusMeters: 500,
    riskLevel: 'tinggi',
  },
  {
    id: 'zone-4',
    name: 'Sesar Batuan Vulkanik Sukun',
    type: 'gempa',
    center: { latitude: -7.9985, longitude: 112.619 },
    radiusMeters: 600,
    riskLevel: 'rendah',
  },
  {
    id: 'zone-5',
    name: 'Bantaran Kali Mewek (Tunjungsekar)',
    type: 'banjir',
    center: { latitude: -7.9315, longitude: 112.6412 },
    radiusMeters: 350,
    riskLevel: 'sedang',
  },
];
