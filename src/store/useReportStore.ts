import { create } from 'zustand';

import { DUMMY_REPORTS } from '@/constants/dummyReports';
import type { Report, ReportFilter } from '@/types';

export const DEFAULT_REPORT_FILTER: ReportFilter = {
  query: '',
  categories: [],
  status: 'semua',
  maxDistanceKm: null,
};

interface ReportState {
  reports: Report[];
  filter: ReportFilter;
  isLoading: boolean;
  error: string | null;
  setReports(r: Report[]): void;
  upsertReport(r: Report): void;
  removeReport(id: string): void;
  setFilter(f: Partial<ReportFilter>): void;
}

/**
 * Store laporan (UDF). Semua perubahan lewat action, selalu immutable.
 * Pakai precision selector: `useReportStore((s) => s.reports)`;
 * untuk banyak field: `useReportStore(useShallow((s) => ({ a: s.a, b: s.b })))`.
 */
export const useReportStore = create<ReportState>()((set) => ({
  // TODO(Orang 1, Minggu 2–3): ganti dummy dengan data dari Supabase.
  reports: DUMMY_REPORTS,
  filter: DEFAULT_REPORT_FILTER,
  isLoading: false,
  error: null,

  setReports: (r) => set({ reports: [...r] }),

  upsertReport: (r) =>
    set((s) => {
      const exists = s.reports.some((x) => x.id === r.id);
      return {
        reports: exists
          ? s.reports.map((x) => (x.id === r.id ? { ...x, ...r } : x))
          : [r, ...s.reports],
      };
    }),

  removeReport: (id) => set((s) => ({ reports: s.reports.filter((x) => x.id !== id) })),

  setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
}));
