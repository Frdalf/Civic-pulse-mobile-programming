import { DEFAULT_REPORT_FILTER, useReportStore } from '@/store/useReportStore';
import type { Report } from '@/types';

const sample = (id: string, overrides: Partial<Report> = {}): Report => ({
  id,
  userId: 'u1',
  category: 'jalan_rusak',
  description: 'test',
  photoUrl: null,
  location: { latitude: -7.97, longitude: 112.63 },
  status: 'baru',
  createdAt: '2026-11-15T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  useReportStore.setState({ reports: [], filter: DEFAULT_REPORT_FILTER });
});

describe('useReportStore', () => {
  it('upsertReport menambah laporan baru di depan secara immutable', () => {
    const before = useReportStore.getState().reports;
    useReportStore.getState().upsertReport(sample('a'));
    const after = useReportStore.getState().reports;
    expect(after).toHaveLength(1);
    expect(after).not.toBe(before);
  });

  it('upsertReport memperbarui laporan yang sudah ada', () => {
    useReportStore.getState().setReports([sample('a'), sample('b')]);
    useReportStore.getState().upsertReport(sample('a', { status: 'selesai' }));
    const { reports } = useReportStore.getState();
    expect(reports).toHaveLength(2);
    expect(reports.find((r) => r.id === 'a')?.status).toBe('selesai');
  });

  it('removeReport menghapus berdasarkan id', () => {
    useReportStore.getState().setReports([sample('a'), sample('b')]);
    useReportStore.getState().removeReport('a');
    expect(useReportStore.getState().reports.map((r) => r.id)).toEqual(['b']);
  });

  it('setFilter menggabungkan sebagian field', () => {
    useReportStore.getState().setFilter({ query: 'lubang' });
    expect(useReportStore.getState().filter).toEqual({ ...DEFAULT_REPORT_FILTER, query: 'lubang' });
  });
});
