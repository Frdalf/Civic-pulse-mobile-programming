import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { DisasterZone, Report, ReportCategory, ReportStatus } from '@/types';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/**
 * Client Supabase dibuat saat pertama dipakai, supaya app tetap bisa jalan
 * (dengan data dummy) walau `.env` belum diisi.
 * @throws Error berbahasa Indonesia jika `.env` belum dikonfigurasi.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase belum dikonfigurasi. Salin .env.example menjadi .env lalu isi URL & anon key.',
    );
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // Sesi TIDAK dipersist oleh supabase-js (default-nya bukan storage terenkripsi).
      // Token disimpan sendiri di secure-store oleh services/auth.ts.
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

// ---------------------------------------------------------------------------
// Mapper snake_case (DB, §5.4) <-> camelCase (types, §5.1)
// ---------------------------------------------------------------------------

export interface DbReportRow {
  id: string;
  user_id: string;
  category: string;
  description: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

export type DbReportInsert = Omit<DbReportRow, 'id' | 'status' | 'created_at'>;

export interface DbDisasterZoneRow {
  id: string;
  name: string;
  type: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  risk_level: string;
}

const CATEGORIES: readonly ReportCategory[] = [
  'jalan_rusak', 'lampu_mati', 'drainase', 'banjir', 'longsor', 'pohon_tumbang', 'lainnya',
];
const STATUSES: readonly ReportStatus[] = ['baru', 'diverifikasi', 'diproses', 'selesai'];
const ZONE_TYPES: readonly DisasterZone['type'][] = ['banjir', 'longsor', 'gempa', 'lainnya'];
const RISK_LEVELS: readonly DisasterZone['riskLevel'][] = ['rendah', 'sedang', 'tinggi'];

function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function toReport(row: DbReportRow): Report {
  return {
    id: row.id,
    userId: row.user_id,
    category: pick(row.category, CATEGORIES, 'lainnya'),
    description: row.description,
    photoUrl: row.photo_url,
    location: { latitude: row.latitude, longitude: row.longitude },
    status: pick(row.status, STATUSES, 'baru'),
    createdAt: row.created_at,
  };
}

export function toReportInsert(
  r: Pick<Report, 'userId' | 'category' | 'description' | 'photoUrl' | 'location'>,
): DbReportInsert {
  return {
    user_id: r.userId,
    category: r.category,
    description: r.description,
    photo_url: r.photoUrl,
    latitude: r.location.latitude,
    longitude: r.location.longitude,
  };
}

export function toDisasterZone(row: DbDisasterZoneRow): DisasterZone {
  return {
    id: row.id,
    name: row.name,
    type: pick(row.type, ZONE_TYPES, 'lainnya'),
    center: { latitude: row.center_lat, longitude: row.center_lng },
    radiusMeters: row.radius_meters,
    riskLevel: pick(row.risk_level, RISK_LEVELS, 'sedang'),
  };
}
