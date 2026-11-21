// Milik Orang 1 — state kontrol UI layar Laporan (search, chip, refresh).
// Penapisan data sendiri dilakukan useReportFilter (Orang 2).
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useReportStore } from '@/store';
import type { ReportCategory, ReportStatus } from '@/types';

export function useReportListControls(setQuery: (q: string) => void) {
  const { filter, setFilter, isLoading, error, loadReports } = useReportStore(
    useShallow((s) => ({
      filter: s.filter,
      setFilter: s.setFilter,
      isLoading: s.isLoading,
      error: s.error,
      loadReports: s.loadReports,
    })),
  );
  const [searchText, setSearchText] = useState(filter.query);

  const onSearch = useCallback(
    (text: string) => {
      setSearchText(text); // input tetap responsif
      setQuery(text); // useReportFilter yang men-debounce
    },
    [setQuery],
  );

  const toggleCategory = useCallback(
    (cat: ReportCategory) => {
      const selected = filter.categories.includes(cat);
      setFilter({
        categories: selected
          ? filter.categories.filter((c) => c !== cat)
          : [...filter.categories, cat],
      });
    },
    [filter.categories, setFilter],
  );

  const setStatus = useCallback(
    (status: ReportStatus | 'semua') => setFilter({ status }),
    [setFilter],
  );

  const refresh = useCallback(() => void loadReports(), [loadReports]);

  const hasActiveFilter =
    searchText.trim() !== '' || filter.categories.length > 0 || filter.status !== 'semua';

  return {
    filter,
    searchText,
    isLoading,
    error,
    hasActiveFilter,
    onSearch,
    toggleCategory,
    setStatus,
    refresh,
  };
}
