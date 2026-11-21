import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { ErrorText } from '@/components/ui/ErrorText';
import { ReportListItem } from '@/components/ui/ReportListItem';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { SearchBar } from '@/components/ui/SearchBar';
import { CATEGORY_META, REPORT_CATEGORIES, STATUS_LABEL } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { useReportFilter } from '@/hooks/useReportFilter';
import { useReportListControls } from '@/hooks/useReportListControls';
import type { Report, ReportStatus } from '@/types';

const keyExtractor = (r: Report) => r.id;
const STATUS_OPTIONS: (ReportStatus | 'semua')[] = [
  'semua',
  'baru',
  'diverifikasi',
  'diproses',
  'selesai',
];

export default function ReportsScreen() {
  const { results, isSearching, setQuery } = useReportFilter();
  const c = useReportListControls(setQuery);

  const openDetail = useCallback((id: string) => {
    router.push({ pathname: '/report/[id]', params: { id } });
  }, []);

  const renderItem = useCallback<ListRenderItem<Report>>(
    ({ item }) => <ReportListItem report={item} onPress={openDetail} />,
    [openDetail],
  );

  return (
    <ScreenPlaceholder title="Laporan" description={`${results.length} laporan`}>
      <View style={styles.controls}>
        <SearchBar value={c.searchText} onChangeText={c.onSearch} busy={isSearching} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {REPORT_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_META[cat].label}
              color={CATEGORY_META[cat].color}
              selected={c.filter.categories.includes(cat)}
              onPress={() => c.toggleCategory(cat)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {STATUS_OPTIONS.map((st) => (
            <Chip
              key={st}
              label={st === 'semua' ? 'Semua status' : STATUS_LABEL[st]}
              selected={c.filter.status === st}
              onPress={() => c.setStatus(st)}
            />
          ))}
        </ScrollView>
        <ErrorText message={c.error} />
      </View>
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={c.isLoading}
        onRefresh={c.refresh}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          c.isLoading ? undefined : (
            <Text style={styles.empty}>
              {c.hasActiveFilter
                ? 'Tidak ada laporan yang cocok dengan filter.'
                : 'Belum ada laporan.'}
            </Text>
          )
        }
      />
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 16 },
  row: { flexGrow: 0, marginBottom: 4 },
  empty: { marginTop: 32, textAlign: 'center', color: colors.textMuted },
});
