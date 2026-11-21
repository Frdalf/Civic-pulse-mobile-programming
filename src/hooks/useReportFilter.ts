// TODO(Orang 2): implementasi asli (Minggu 3) — Subject<string> → debounceTime(300)
// → distinctUntilChanged() → switchMap(...), dukung maxDistanceKm, unsubscribe saat unmount.
// Stub sementara dari Orang 1: filter lokal sinkron TANPA RxJS agar layar Laporan bisa dites.
// Signature sesuai PROJECT_CONTEXT §5.3 — silakan ganti seluruh isi file.
import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useReportStore } from '@/store';
import type { Report } from '@/types';

export function useReportFilter(): {
  results: Report[];
  isSearching: boolean;
  setQuery(q: string): void;
} {
  const { reports, filter, setFilter } = useReportStore(
    useShallow((s) => ({ reports: s.reports, filter: s.filter, setFilter: s.setFilter })),
  );

  const results = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    return reports.filter(
      (r) =>
        (filter.categories.length === 0 || filter.categories.includes(r.category)) &&
        (filter.status === 'semua' || r.status === filter.status) &&
        (q === '' || r.description.toLowerCase().includes(q)),
    );
  }, [reports, filter]);

  const setQuery = useCallback((q: string) => setFilter({ query: q }), [setFilter]);

  return { results, isSearching: false, setQuery };
}
