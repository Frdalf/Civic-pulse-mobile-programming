import { create } from 'zustand';

import type { DisasterZone } from '@/types';

interface ZoneState {
  zones: DisasterZone[];
  /** Zona yang sedang dimasuki user. */
  activeZoneIds: string[];
  setZones(z: DisasterZone[]): void;
  setActiveZones(ids: string[]): void;
}

export const useZoneStore = create<ZoneState>()((set) => ({
  zones: [],
  activeZoneIds: [],
  setZones: (z) => set({ zones: [...z] }),
  setActiveZones: (ids) => set({ activeZoneIds: [...ids] }),
}));
