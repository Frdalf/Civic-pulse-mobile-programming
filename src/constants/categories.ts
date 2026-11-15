import type { ReportCategory, ReportStatus } from '@/types';

export interface CategoryMeta {
  label: string;
  color: string;
}

export const CATEGORY_META: Record<ReportCategory, CategoryMeta> = {
  jalan_rusak: { label: 'Jalan Rusak', color: '#8D6E63' },
  lampu_mati: { label: 'Lampu Mati', color: '#F9A825' },
  drainase: { label: 'Drainase', color: '#00838F' },
  banjir: { label: 'Banjir', color: '#1565C0' },
  longsor: { label: 'Longsor', color: '#6D4C41' },
  pohon_tumbang: { label: 'Pohon Tumbang', color: '#2E7D32' },
  lainnya: { label: 'Lainnya', color: '#616161' },
};

export const REPORT_CATEGORIES = Object.keys(CATEGORY_META) as ReportCategory[];

export const STATUS_LABEL: Record<ReportStatus, string> = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  diproses: 'Diproses',
  selesai: 'Selesai',
};
