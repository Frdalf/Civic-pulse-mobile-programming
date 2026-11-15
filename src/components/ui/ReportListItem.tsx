import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_META, STATUS_LABEL } from '@/constants/categories';
import { colors } from '@/constants/colors';
import type { Report } from '@/types';

interface Props {
  report: Report;
  onPress(id: string): void;
}

function ReportListItemBase({ report, onPress }: Props) {
  const meta = CATEGORY_META[report.category];
  return (
    <Pressable
      onPress={() => onPress(report.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Laporan ${meta.label}, status ${STATUS_LABEL[report.status]}`}
    >
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <View style={styles.body}>
        <Text style={styles.category}>{meta.label}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>
      </View>
      <Text style={styles.status}>{STATUS_LABEL[report.status]}</Text>
    </Pressable>
  );
}

export const ReportListItem = memo(ReportListItemBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  body: { flex: 1 },
  category: { fontWeight: '600', color: colors.text },
  description: { marginTop: 2, color: colors.textMuted },
  status: { marginLeft: 8, fontSize: 12, color: colors.primary, fontWeight: '600' },
});
