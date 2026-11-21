import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportMarker } from '@/components/map/ReportMarker';
import { CATEGORY_META, STATUS_LABEL } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { useReportStore } from '@/store';
import type { ReportStatus } from '@/types';
import { formatWatermarkCoordinates, formatWatermarkDate } from '@/utils/watermark';

const STATUS_STEPS: ReportStatus[] = ['baru', 'diverifikasi', 'diproses', 'selesai'];
const MINI_MAP_DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 };

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useReportStore((s) => s.reports.find((r) => r.id === id));
  const insets = useSafeAreaInsets();

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Laporan tidak ditemukan atau sudah dihapus.</Text>
      </View>
    );
  }

  const meta = CATEGORY_META[report.category];
  const stepIndex = STATUS_STEPS.indexOf(report.status);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      {report.photoUrl ? (
        <Image
          source={{ uri: report.photoUrl }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={`Foto laporan ${meta.label}`}
        />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Text style={styles.muted}>Tanpa foto</Text>
        </View>
      )}

      <View style={styles.titleRow}>
        <View style={[styles.dot, { backgroundColor: meta.color }]} />
        <Text style={styles.title} accessibilityRole="header">
          {meta.label}
        </Text>
      </View>
      <Text style={styles.muted}>{formatWatermarkDate(new Date(report.createdAt))}</Text>
      {report.pendingSync ? <Text style={styles.pending}>Menunggu dikirim (offline)</Text> : null}

      <Text style={styles.description}>{report.description}</Text>

      <Text style={styles.section}>Status</Text>
      <View style={styles.steps} accessibilityLabel={`Status: ${STATUS_LABEL[report.status]}`}>
        {STATUS_STEPS.map((st, i) => (
          <View key={st} style={styles.step}>
            <View style={[styles.stepBar, i <= stepIndex && styles.stepBarDone]} />
            <Text style={[styles.stepLabel, i === stepIndex && styles.stepLabelActive]}>
              {STATUS_LABEL[st]}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Lokasi</Text>
      <Text style={styles.muted}>{formatWatermarkCoordinates(report.location)}</Text>
      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...report.location, ...MINI_MAP_DELTA }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          liteMode
          accessibilityLabel="Peta lokasi laporan"
        >
          <ReportMarker report={report} userLocation={null} />
        </MapView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: colors.border },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  muted: { color: colors.textMuted, marginTop: 2 },
  pending: { marginTop: 6, color: colors.warning, fontWeight: '600' },
  description: { marginTop: 12, fontSize: 16, lineHeight: 22, color: colors.text },
  section: { marginTop: 20, marginBottom: 6, fontWeight: '700', color: colors.text },
  steps: { flexDirection: 'row' },
  step: { flex: 1, marginRight: 4 },
  stepBar: { height: 6, borderRadius: 3, backgroundColor: colors.border },
  stepBarDone: { backgroundColor: colors.primary },
  stepLabel: { marginTop: 4, fontSize: 11, color: colors.textMuted },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  mapWrap: { marginTop: 8, height: 180, borderRadius: 12, overflow: 'hidden' },
});
