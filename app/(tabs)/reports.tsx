import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';

import { ReportListItem } from '@/components/ui/ReportListItem';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { useReportStore } from '@/store';
import type { Report } from '@/types';

const keyExtractor = (r: Report) => r.id;

export default function ReportsScreen() {
  const reports = useReportStore((s) => s.reports);

  const openDetail = useCallback((id: string) => {
    router.push({ pathname: '/report/[id]', params: { id } });
  }, []);

  const renderItem = useCallback<ListRenderItem<Report>>(
    ({ item }) => <ReportListItem report={item} onPress={openDetail} />,
    [openDetail],
  );

  // TODO(Orang 1, Minggu 3): search bar + chip filter via useReportFilter.
  return (
    <ScreenPlaceholder title="Laporan" description={`${reports.length} laporan (data dummy)`}>
      <FlatList data={reports} keyExtractor={keyExtractor} renderItem={renderItem} />
    </ScreenPlaceholder>
  );
}
