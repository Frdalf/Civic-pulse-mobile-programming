import { useLocalSearchParams } from 'expo-router';

import { CATEGORY_META, STATUS_LABEL } from '@/constants/categories';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { useReportStore } from '@/store';

// TODO(Orang 1, Minggu 3): foto, peta mini, status lengkap.
export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useReportStore((s) => s.reports.find((r) => r.id === id));

  if (!report) {
    return <ScreenPlaceholder title="Laporan tidak ditemukan" />;
  }
  return (
    <ScreenPlaceholder
      title={CATEGORY_META[report.category].label}
      description={`${STATUS_LABEL[report.status]} · ${report.description}`}
    />
  );
}
