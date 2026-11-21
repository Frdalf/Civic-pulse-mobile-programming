import type { DisasterZone } from '@/types';

import { getSupabase, toDisasterZone, type DbDisasterZoneRow } from './supabase';

/** Ambil zona rawan bencana dari tabel `disaster_zones` (Orang 2 — Minggu 3). */
export async function fetchZones(): Promise<DisasterZone[]> {
  const { data, error } = await getSupabase()
    .from('disaster_zones')
    .select('*')
    .returns<DbDisasterZoneRow[]>();
  if (error) throw new Error(`Gagal memuat zona rawan: ${error.message}`);
  return data.map(toDisasterZone);
}
