import { useEffect } from 'react';

import {
  getSupabase,
  isSupabaseConfigured,
  toReport,
  type DbReportRow,
} from '@/services/supabase';
import { useReportStore } from '@/store';

/**
 * Hook integrasi data real-time laporan via Supabase Realtime (Orang 2 — Minggu 3).
 *
 * Menyimak kanal PostgreSQL changes (`reports`) untuk event INSERT dan UPDATE,
 * lalu memperbarui store Zustand secara UDF (`upsertReport`).
 * Memanggil `removeChannel` saat unmount untuk mencegah kebocoran memori.
 */
export function useRealtimeReports(): void {
  const upsertReport = useReportStore((s) => s.upsertReport);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabase();
    const channel = supabase
      .channel('public:reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.new) {
            const newReport = toReport(payload.new as DbReportRow);
            upsertReport(newReport);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.new) {
            const updatedReport = toReport(payload.new as DbReportRow);
            upsertReport(updatedReport);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [upsertReport]);
}
