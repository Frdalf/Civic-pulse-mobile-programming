import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { useShallow } from 'zustand/react/shallow';

import { useLocationTracking } from '@/hooks/useLocationTracking';
import { searchReportIds } from '@/services/reports';
import { isSupabaseConfigured } from '@/services/supabase';
import { useNetworkStore, useReportStore } from '@/store';
import type { Coordinate, Report, ReportFilter } from '@/types';
import { haversineKm } from '@/utils/haversine';

export interface UseReportFilterResult {
  results: Report[];
  isSearching: boolean;
  setQuery(q: string): void;
}

interface Snapshot {
  reports: Report[];
  filter: ReportFilter;
  location: Coordinate | null;
}

interface QueryMatch {
  query: string;
  /** Id hasil pencarian server; null = pakai pencocokan teks lokal saja. */
  remoteIds: Set<string> | null;
}

/** Fungsi murni penapisan — dipisah agar mudah dites. */
export function applyReportFilter(s: Snapshot, m: QueryMatch): Report[] {
  const q = m.query.trim().toLowerCase();
  return s.reports.filter((r) => {
    if (s.filter.categories.length > 0 && !s.filter.categories.includes(r.category)) return false;
    if (s.filter.status !== 'semua' && r.status !== s.filter.status) return false;
    if (q !== '') {
      const localMatch =
        r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      if (!localMatch && !m.remoteIds?.has(r.id)) return false;
    }
    if (s.filter.maxDistanceKm !== null && s.location) {
      if (haversineKm(s.location, r.location) > s.filter.maxDistanceKm) return false;
    }
    return true;
  });
}

/** Pencarian server yang bisa dibatalkan: unsubscribe (oleh switchMap) → AbortController.abort(). */
function remoteSearch(query: string): Observable<QueryMatch> {
  return new Observable<QueryMatch>((subscriber) => {
    const controller = new AbortController();
    searchReportIds(query, controller.signal)
      .then((ids) => {
        subscriber.next({ query, remoteIds: new Set(ids) });
        subscriber.complete();
      })
      .catch((e: unknown) => subscriber.error(e));
    return () => controller.abort();
  });
}

/**
 * Penapisan laporan reaktif berbasis RxJS (Orang 2 — Minggu 3).
 *
 * query$ → debounceTime(300) → distinctUntilChanged() → switchMap(pencarian Supabase,
 * fallback lokal bila offline/gagal) → combineLatest dengan snapshot store (kategori,
 * status, maxDistanceKm, laporan realtime) → results.
 *
 * Cleanup: subscription di-unsubscribe saat unmount; switchMap membatalkan request lama.
 */
export function useReportFilter(): UseReportFilterResult {
  const { reports, filter, setFilter } = useReportStore(
    useShallow((s) => ({ reports: s.reports, filter: s.filter, setFilter: s.setFilter })),
  );
  const { location } = useLocationTracking();

  const [query$] = useState(() => new Subject<string>());
  const [snapshot$] = useState(
    () => new BehaviorSubject<Snapshot>({ reports, filter, location }),
  );
  const [initialQuery] = useState(filter.query);
  const [results, setResults] = useState<Report[]>(() =>
    applyReportFilter({ reports, filter, location }, { query: filter.query, remoteIds: null }),
  );
  const [isSearching, setIsSearching] = useState(false);
  // Query terakhir yang lolos distinctUntilChanged — untuk menentukan perlu spinner atau tidak.
  const lastQueryRef = useRef(initialQuery);

  // Dorong perubahan store/lokasi ke stream (filter non-teks diterapkan tanpa debounce).
  useEffect(() => {
    snapshot$.next({ reports, filter, location });
  }, [snapshot$, reports, filter, location]);

  useEffect(() => {
    const match$ = query$.pipe(
      debounceTime(300),
      startWith(initialQuery),
      distinctUntilChanged(),
      tap((q) => {
        lastQueryRef.current = q;
        setFilter({ query: q });
      }),
      switchMap((q): Observable<QueryMatch> => {
        const local = of<QueryMatch>({ query: q, remoteIds: null });
        if (q.trim() === '' || !isSupabaseConfigured || !useNetworkStore.getState().isOnline) {
          return local;
        }
        return remoteSearch(q.trim()).pipe(catchError(() => local));
      }),
    );

    const subscription = combineLatest([snapshot$, match$])
      .pipe(map(([snap, match]) => applyReportFilter(snap, match)))
      .subscribe((next) => {
        setResults(next);
        setIsSearching(false);
      });

    return () => subscription.unsubscribe();
  }, [query$, snapshot$, initialQuery, setFilter]);

  const setQuery = useCallback(
    (q: string) => {
      // Bila kembali ke query yang sama, distinctUntilChanged tidak akan emit → jangan spinner.
      setIsSearching(q !== lastQueryRef.current);
      query$.next(q);
    },
    [query$],
  );

  return { results, isSearching, setQuery };
}
