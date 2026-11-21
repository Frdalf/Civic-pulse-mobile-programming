import { applyReportFilter } from '@/hooks/useReportFilter';
import { DEFAULT_REPORT_FILTER } from '@/store/useReportStore';
import type { Report } from '@/types';

jest.mock('@/hooks/useLocationTracking', () => ({ useLocationTracking: jest.fn() }));
jest.mock('@/services/reports', () => ({ searchReportIds: jest.fn(), fetchReports: jest.fn() }));

const r = (id: string, o: Partial<Report> = {}): Report => ({
  id,
  userId: 'u',
  category: 'banjir',
  description: 'genangan air',
  photoUrl: null,
  location: { latitude: -7.97, longitude: 112.63 },
  status: 'baru',
  createdAt: '2026-11-21T00:00:00.000Z',
  ...o,
});

const reports = [
  r('a'),
  r('b', { category: 'lampu_mati', description: 'lampu PJU mati', status: 'selesai' }),
  r('c', { description: 'jalan berlubang', location: { latitude: -7.5, longitude: 112.63 } }),
];
const snap = (f: Partial<typeof DEFAULT_REPORT_FILTER> = {}) => ({
  reports,
  filter: { ...DEFAULT_REPORT_FILTER, ...f },
  location: { latitude: -7.97, longitude: 112.63 },
});
const ids = (list: Report[]) => list.map((x) => x.id);
const noQuery = { query: '', remoteIds: null };

describe('applyReportFilter', () => {
  it('tanpa filter mengembalikan semua', () => {
    expect(ids(applyReportFilter(snap(), noQuery))).toEqual(['a', 'b', 'c']);
  });

  it('memfilter kategori dan status', () => {
    expect(ids(applyReportFilter(snap({ categories: ['banjir'] }), noQuery))).toEqual(['a', 'c']);
    expect(ids(applyReportFilter(snap({ status: 'selesai' }), noQuery))).toEqual(['b']);
  });

  it('mencocokkan teks lokal, ditambah hasil pencarian server', () => {
    expect(ids(applyReportFilter(snap(), { query: 'LAMPU', remoteIds: null }))).toEqual(['b']);
    expect(ids(applyReportFilter(snap(), { query: 'lampu', remoteIds: new Set(['c']) }))).toEqual(['b', 'c']);
  });

  it('memfilter berdasarkan maxDistanceKm (Haversine)', () => {
    // c berjarak ~52 km dari lokasi user
    expect(ids(applyReportFilter(snap({ maxDistanceKm: 10 }), noQuery))).toEqual(['a', 'b']);
  });
});
