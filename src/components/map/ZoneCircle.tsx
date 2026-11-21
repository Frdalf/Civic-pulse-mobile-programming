import React, { memo } from 'react';
import { Circle } from 'react-native-maps';

import type { DisasterZone } from '@/types';

const RISK_COLORS: Record<DisasterZone['riskLevel'], { stroke: string; fill: string }> = {
  tinggi: {
    stroke: '#C62828',
    fill: 'rgba(198, 40, 40, 0.25)',
  },
  sedang: {
    stroke: '#E08E0B',
    fill: 'rgba(224, 142, 11, 0.25)',
  },
  rendah: {
    stroke: '#2E7D32',
    fill: 'rgba(46, 125, 50, 0.25)',
  },
};

export interface ZoneCircleProps {
  zone: DisasterZone;
}

/**
 * Komponen lingkaran visual zona rawan bencana di peta (Orang 2 — Minggu 3).
 * Menyesuaikan warna fill & stroke berdasarkan tingkat risiko (tinggi, sedang, rendah).
 * Dioptimalkan dengan React.memo untuk mempertahankan performa 60 FPS.
 */
function ZoneCircleComponent({ zone }: ZoneCircleProps) {
  const color = RISK_COLORS[zone.riskLevel] ?? RISK_COLORS.sedang;

  return (
    <Circle
      center={{
        latitude: zone.center.latitude,
        longitude: zone.center.longitude,
      }}
      radius={zone.radiusMeters}
      strokeColor={color.stroke}
      fillColor={color.fill}
      strokeWidth={2}
    />
  );
}

export const ZoneCircle = memo(ZoneCircleComponent);
