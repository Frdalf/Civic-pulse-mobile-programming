// Kontrak bersama — PROJECT_CONTEXT.md §5.1. Jangan diubah sepihak.

export type ReportCategory =
  | 'jalan_rusak' | 'lampu_mati' | 'drainase' | 'banjir'
  | 'longsor' | 'pohon_tumbang' | 'lainnya';

export type ReportStatus = 'baru' | 'diverifikasi' | 'diproses' | 'selesai';

export interface Coordinate { latitude: number; longitude: number; }

export interface Report {
  id: string;
  userId: string;
  category: ReportCategory;
  description: string;
  photoUrl: string | null;     // URL Supabase Storage (sudah ber-watermark)
  location: Coordinate;
  status: ReportStatus;
  createdAt: string;           // ISO string
  pendingSync?: boolean;       // true jika masih di antrean offline
}

export interface DisasterZone {
  id: string;
  name: string;
  type: 'banjir' | 'longsor' | 'gempa' | 'lainnya';
  center: Coordinate;
  radiusMeters: number;
  riskLevel: 'rendah' | 'sedang' | 'tinggi';
}

export interface VaultDocument {
  id: string;
  name: string;
  uri: string;                 // path di documentDirectory
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ReportFilter {
  query: string;
  categories: ReportCategory[];
  status: ReportStatus | 'semua';
  maxDistanceKm: number | null;
}
