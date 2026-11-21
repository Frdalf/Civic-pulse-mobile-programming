import { useCallback, useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { useShallow } from 'zustand/react/shallow';

import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useReportStore } from '@/store';
import type { Report } from '@/types';
import { haversineKm } from '@/utils/haversine';

export interface UseReportFilterResult {
  results: Report[];
  isSearching: boolean;
  setQuery(q: string): void;
}

/**
 * Hook penapisan laporan reaktif berbasis RxJS (Orang 2 — Minggu 3).
 *
 * Menggunakan pipeline:
 * `Subject<string>` → `debounceTime(300)` → `distinctUntilChanged()` → `switchMap`
 * Mendukung filter multi-kategori, status, query teks, dan jarak maksimal (`maxDistanceKm`).
 * Dilengkapi dengan pembersihan (`unsubscribe()`) saat unmount (Zero Memory Leak).
 */
export function useReportFilter(): UseReportFilterResult {
  const { reports, filter, setFilter } = useReportStore(
    useShallow((s) => ({
      reports: s.reports,
      filter: s.filter,
      setFilter: s.setFilter,
    }))
  );

  const { location } = useLocationTracking();
  const [isSearching, setIsSearching] = useState(false);
  const [searchSubject] = useState(() => new Subject<string>());

  useEffect(() => {
    // Pipeline RxJS reaktif
    const subscription = searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe({
        next: (query) => {
          setFilter({ query });
          setIsSearching(false);
        },
        error: () => {
          setIsSearching(false);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchSubject, setFilter]);

  const setQuery = useCallback(
    (q: string) => {
      setIsSearching(true);
      searchSubject.next(q);
    },
    [searchSubject]
  );

  const results = useMemo(() => {
    const q = filter.query.trim().toLowerCase();

    return reports.filter((r) => {
      // 1. Filter Kategori
      if (filter.categories.length > 0 && !filter.categories.includes(r.category)) {
        return false;
      }

      // 2. Filter Status
      if (filter.status !== 'semua' && r.status !== filter.status) {
        return false;
      }

      // 3. Filter Query Pencarian (deskripsi atau kategori)
      if (
        q !== '' &&
        !r.description.toLowerCase().includes(q) &&
        !r.category.toLowerCase().includes(q)
      ) {
        return false;
      }

      // 4. Filter Radius Jarak Maksimal (Haversine)
      if (filter.maxDistanceKm !== null && location) {
        const distKm = haversineKm(location, r.location);
        if (distKm > filter.maxDistanceKm) {
          return false;
        }
      }

      return true;
    });
  }, [reports, filter, location]);

  return { results, isSearching, setQuery };
}
