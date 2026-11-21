import React, { useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportMarker } from '@/components/map/ReportMarker';
import { ZoneCircle } from '@/components/map/ZoneCircle';
import { colors } from '@/constants/colors';
import { MALANG_CENTER } from '@/constants/config';
import { MALANG_DISASTER_ZONES } from '@/constants/dummyZones';
import { useGeofence } from '@/hooks/useGeofence';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { useReportStore, useZoneStore } from '@/store';
import type { Report } from '@/types';

const INITIAL_REGION = {
  latitude: MALANG_CENTER.latitude,
  longitude: MALANG_CENTER.longitude,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

/**
 * Layar Peta Laporan Warga, LBS & Geofencing (Orang 2 — Minggu 1 & 3).
 * Menampilkan sebaran laporan warga, zona rawan bencana ber-radius,
 * posisi perangkat, serta kalkulasi jarak dan notifikasi geofence real-time.
 */
export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);

  // Precision selectors sesuai konvensi Zustand UDF
  const reports = useReportStore((s) => s.reports);
  const zones = useZoneStore((s) => s.zones);
  const setZones = useZoneStore((s) => s.setZones);

  // Inisialisasi zona rawan jika belum tersedia
  useEffect(() => {
    if (zones.length === 0) {
      setZones(MALANG_DISASTER_ZONES);
    }
  }, [zones.length, setZones]);

  // Hook LBS adaptif (milik Orang 2)
  const { location, error: locationError, permission } = useLocationTracking();

  // Hook Geofencing aktif & notifikasi lokal masuk zona (milik Orang 2)
  const { insideZones } = useGeofence(zones, location);

  // Hook Real-time updates Supabase (milik Orang 2)
  useRealtimeReports();

  const handleCalloutPress = useCallback(
    (report: Report) => {
      router.push({
        pathname: '/report/[id]',
        params: { id: report.id },
      });
    },
    [router]
  );

  const handleCenterUserLocation = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [location]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={permission === 'granted'}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {/* Lingkaran Zona Rawan Bencana */}
        {zones.map((zone) => (
          <ZoneCircle key={zone.id} zone={zone} />
        ))}

        {/* Marker Laporan Warga */}
        {reports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            userLocation={location}
            onCalloutPress={handleCalloutPress}
          />
        ))}
      </MapView>

      {/* Floating Info Banner & Status Zona/Izin */}
      <View style={[styles.topOverlay, { top: insets.top + 8 }]}>
        <View style={styles.badgeCard}>
          <Text style={styles.badgeTitle}>Peta Civic Pulse</Text>
          <Text style={styles.badgeSubtitle}>
            {reports.length} laporan · {zones.length} zona rawan bencana
          </Text>
        </View>

        {insideZones.length > 0 && (
          <View style={styles.dangerBanner}>
            <Text style={styles.dangerText}>
              🚨 Anda berada di dalam zona: {insideZones.map((z) => z.name).join(', ')}
            </Text>
          </View>
        )}

        {permission === 'denied' && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ {locationError ?? 'Izin lokasi dinonaktifkan. Jarak belum dapat dihitung.'}
            </Text>
          </View>
        )}
      </View>

      {/* Tombol Aksi Cepat: Pusatkan ke Lokasi Saya */}
      {permission === 'granted' && location && (
        <TouchableOpacity
          style={[styles.myLocationFab, { bottom: insets.bottom + 24 }]}
          onPress={handleCenterUserLocation}
          activeOpacity={0.8}
          accessibilityLabel="Pusatkan peta ke lokasi saya"
          accessibilityRole="button"
        >
          <Text style={styles.myLocationFabIcon}>🎯</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  topOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 8,
    pointerEvents: 'box-none',
  },
  badgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  badgeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dangerBanner: {
    backgroundColor: 'rgba(255, 235, 238, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  dangerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 243, 224, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: 12,
    color: '#8D6E63',
  },
  myLocationFab: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  myLocationFabIcon: {
    fontSize: 22,
  },
});
