import type { Report } from '@/types';

// Data dummy Minggu 1 (wilayah Malang). Diganti data Supabase mulai Minggu 2–3.
export const DUMMY_REPORTS: Report[] = [
  {
    id: 'dummy-1', userId: 'dummy-user', category: 'jalan_rusak',
    description: 'Lubang besar di Jl. Soekarno-Hatta dekat jembatan.',
    photoUrl: null, location: { latitude: -7.9449, longitude: 112.6203 },
    status: 'baru', createdAt: '2026-11-14T02:15:00.000Z',
  },
  {
    id: 'dummy-2', userId: 'dummy-user', category: 'lampu_mati',
    description: 'Lampu PJU mati sepanjang 200 m di Jl. Veteran.',
    photoUrl: null, location: { latitude: -7.9555, longitude: 112.6142 },
    status: 'diverifikasi', createdAt: '2026-11-13T12:40:00.000Z',
  },
  {
    id: 'dummy-3', userId: 'dummy-user', category: 'drainase',
    description: 'Saluran air tersumbat sampah di Jl. Ijen.',
    photoUrl: null, location: { latitude: -7.9690, longitude: 112.6203 },
    status: 'diproses', createdAt: '2026-11-12T08:05:00.000Z',
  },
  {
    id: 'dummy-4', userId: 'dummy-user', category: 'banjir',
    description: 'Genangan setinggi 30 cm di Jl. Galunggung saat hujan.',
    photoUrl: null, location: { latitude: -7.9629, longitude: 112.6116 },
    status: 'baru', createdAt: '2026-11-14T09:30:00.000Z',
  },
  {
    id: 'dummy-5', userId: 'dummy-user', category: 'longsor',
    description: 'Tebing kecil longsor di Jl. Raya Tlogomas dekat UMM.',
    photoUrl: null, location: { latitude: -7.9213, longitude: 112.5967 },
    status: 'diverifikasi', createdAt: '2026-11-11T23:50:00.000Z',
  },
  {
    id: 'dummy-6', userId: 'dummy-user', category: 'pohon_tumbang',
    description: 'Pohon tumbang menutup separuh jalan di Jl. Semeru.',
    photoUrl: null, location: { latitude: -7.9758, longitude: 112.6265 },
    status: 'selesai', createdAt: '2026-11-10T06:20:00.000Z',
  },
  {
    id: 'dummy-7', userId: 'dummy-user', category: 'lainnya',
    description: 'Rambu lalu lintas roboh di perempatan Jl. Kawi.',
    photoUrl: null, location: { latitude: -7.9773, longitude: 112.6232 },
    status: 'baru', createdAt: '2026-11-15T01:10:00.000Z',
  },
];
