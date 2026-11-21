import { create } from 'zustand';

import { DUMMY_REPORTS } from '@/constants/dummyReports';
import { fetchReports } from '@/services/reports';
import { isSupabaseConfigured } from '@/services/supabase';
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
  /** Tambahan Orang 1: muat laporan dari Supabase, isi isLoading & error. */
  loadReports(): Promise<void>;
  /** Tambahan Orang 1 untuk offline queue (Orang 2): ganti id sementara dengan id server. */
  replaceReport(tempId: string, r: Report): void;
  /** Tambahan Orang 1: reset filter ke default. */
  resetFilter(): void;
}

/**
 * Store laporan (UDF). Semua perubahan lewat action, selalu immutable.
 * Pakai precision selector: `useReportStore((s) => s.reports)`;
 * untuk banyak field: `useReportStore(useShallow((s) => ({ a: s.a, b: s.b })))`.
 */
export const useReportStore = create<ReportState>()((set) => ({
  // Dummy hanya dipakai bila Supabase belum dikonfigurasi (.env kosong).
  reports: isSupabaseConfigured ? [] : DUMMY_REPORTS,
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

  resetFilter: () => set({ filter: DEFAULT_REPORT_FILTER }),

  replaceReport: (tempId, r) =>
    set((s) => ({
      reports: [r, ...s.reports.filter((x) => x.id !== tempId && x.id !== r.id)],
    })),

  loadReports: async () => {
    if (!isSupabaseConfigured) return;
    set({ isLoading: true, error: null });
    try {
      const remote = await fetchReports();
      set((s) => ({
        // Laporan yang masih di antrean offline tetap dipertahankan.
        reports: [...s.reports.filter((x) => x.pendingSync), ...remote],
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Gagal memuat laporan.' });
    }
  },
}));
