import { fetchReports } from '@/services/reports';
import { DEFAULT_REPORT_FILTER, useReportStore } from '@/store/useReportStore';
import type { Report } from '@/types';

jest.mock('@/services/supabase', () => ({ isSupabaseConfigured: true }));
jest.mock('@/services/reports', () => ({ fetchReports: jest.fn() }));

const mockedFetch = jest.mocked(fetchReports);

const sample = (id: string, overrides: Partial<Report> = {}): Report => ({
  id,
  userId: 'u1',
  category: 'banjir',
  description: 'test',
  photoUrl: null,
  location: { latitude: -7.97, longitude: 112.63 },
  status: 'baru',
  createdAt: '2026-11-21T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  jest.resetAllMocks();
  useReportStore.setState({ reports: [], filter: DEFAULT_REPORT_FILTER, isLoading: false, error: null });
});

describe('useReportStore.loadReports', () => {
  it('mengisi laporan dan mempertahankan yang pendingSync', async () => {
    useReportStore.setState({ reports: [sample('tmp', { pendingSync: true }), sample('lama')] });
    mockedFetch.mockResolvedValue([sample('a'), sample('b')]);
    await useReportStore.getState().loadReports();
    const s = useReportStore.getState();
    expect(s.reports.map((r) => r.id)).toEqual(['tmp', 'a', 'b']);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('menyimpan pesan error tanpa reject', async () => {
    mockedFetch.mockRejectedValue(new Error('Gagal memuat laporan: timeout'));
    await expect(useReportStore.getState().loadReports()).resolves.toBeUndefined();
    expect(useReportStore.getState()).toMatchObject({
      isLoading: false,
      error: 'Gagal memuat laporan: timeout',
    });
  });
});

describe('useReportStore actions tambahan', () => {
  it('replaceReport mengganti id sementara dengan laporan server', () => {
    useReportStore.setState({ reports: [sample('tmp', { pendingSync: true }), sample('x')] });
    useReportStore.getState().replaceReport('tmp', sample('server-1'));
    expect(useReportStore.getState().reports.map((r) => r.id)).toEqual(['server-1', 'x']);
  });

  it('resetFilter mengembalikan filter default', () => {
    useReportStore.getState().setFilter({ query: 'x', status: 'selesai', categories: ['banjir'] });
    useReportStore.getState().resetFilter();
    expect(useReportStore.getState().filter).toEqual(DEFAULT_REPORT_FILTER);
  });
});
