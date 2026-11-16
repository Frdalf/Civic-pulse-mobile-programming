import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';

import { CATEGORY_META, STATUS_LABEL } from '@/constants/categories';
import type { Coordinate, Report, ReportCategory } from '@/types';
import { formatDistance, haversineKm } from '@/utils/haversine';

const CATEGORY_ICONS: Record<ReportCategory, string> = {
  jalan_rusak: '🚧',
  lampu_mati: '💡',
  drainase: '🚰',
  banjir: '🌊',
  longsor: '⛰️',
  pohon_tumbang: '🪵',
  lainnya: '📍',
};

export interface ReportMarkerProps {
  report: Report;
  userLocation: Coordinate | null;
  onCalloutPress?: (report: Report) => void;
}

/**
 * Komponen Marker untuk laporan warga (Orang 2 — Milestone P9).
 * Dioptimalkan dengan React.memo dan tracksViewChanges dinamis
 * untuk menjaga performa rendering 60 FPS.
 */
function ReportMarkerComponent({
  report,
  userLocation,
  onCalloutPress,
}: ReportMarkerProps) {
  // tracksViewChanges dimulai true agar marker ter-render sempurna,
  // lalu di-freeze ke false untuk mencegah re-render berlebihan saat panning.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [report.category, report.status]);

  const meta = CATEGORY_META[report.category] ?? CATEGORY_META.lainnya;
  const icon = CATEGORY_ICONS[report.category] ?? '📍';
  const statusText = STATUS_LABEL[report.status] ?? report.status;

  const distanceKm = useMemo(() => {
    if (!userLocation) return null;
    return haversineKm(userLocation, report.location);
  }, [userLocation, report.location]);

  const formattedDistance = formatDistance(distanceKm);

  return (
    <Marker
      coordinate={{
        latitude: report.location.latitude,
        longitude: report.location.longitude,
      }}
      tracksViewChanges={tracksViewChanges}
    >
      {/* Visual Marker Pin Custom */}
      <View style={[styles.markerContainer, { borderColor: meta.color }]}>
        <View style={[styles.markerBadge, { backgroundColor: meta.color }]}>
          <Text style={styles.markerIcon}>{icon}</Text>
        </View>
        <View style={[styles.markerArrow, { borderTopColor: meta.color }]} />
      </View>

      {/* Callout Informasi & Jarak */}
      <Callout
        tooltip={false}
        onPress={() => onCalloutPress?.(report)}
        style={styles.callout}
      >
        <View style={styles.calloutContent}>
          <View style={styles.calloutHeader}>
            <View style={[styles.categoryTag, { backgroundColor: meta.color }]}>
              <Text style={styles.categoryTagText}>{meta.label}</Text>
            </View>
            <View style={styles.statusTag}>
              <Text style={styles.statusTagText}>{statusText}</Text>
            </View>
          </View>

          <Text style={styles.calloutDescription} numberOfLines={2}>
            {report.description}
          </Text>

          <View style={styles.calloutFooter}>
            <Text style={styles.distanceText}>
              📍 Jarak:{' '}
              <Text style={styles.distanceValue}>
                {userLocation ? formattedDistance : 'Menunggu lokasi...'}
              </Text>
            </Text>
            <Text style={styles.detailHint}>Ketuk untuk detail →</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

export const ReportMarker = memo(ReportMarkerComponent);

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 48,
  },
  markerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 18,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  callout: {
    width: 250,
    padding: 2,
  },
  calloutContent: {
    gap: 6,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 1,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#ECEFF1',
  },
  statusTagText: {
    color: '#455A64',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#263238',
    lineHeight: 16,
  },
  calloutFooter: {
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CFD8DC',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 11,
    color: '#607D8B',
  },
  distanceValue: {
    fontWeight: 'bold',
    color: '#1B1F1D',
  },
  detailHint: {
    fontSize: 10,
    color: '#0B6E4F',
    fontWeight: '600',
  },
});
