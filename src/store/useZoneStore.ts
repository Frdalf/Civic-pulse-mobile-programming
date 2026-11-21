import { create } from 'zustand';

import { MALANG_DISASTER_ZONES } from '@/constants/dummyZones';
import { isSupabaseConfigured } from '@/services/supabase';
import { fetchZones } from '@/services/zones';
import type { DisasterZone } from '@/types';

interface ZoneState {
  zones: DisasterZone[];
  /** Zona yang sedang dimasuki user. */
  activeZoneIds: string[];
  setZones(z: DisasterZone[]): void;
  setActiveZones(ids: string[]): void;
  /** Tambahan Orang 1: error terakhir saat memuat zona (null jika sukses). */
  zonesError: string | null;
  /**
   * Tambahan Orang 1: muat zona dari Supabase. Bila gagal / belum dikonfigurasi,
   * pakai data cadangan lokal agar geofencing tetap berjalan. Tidak pernah reject.
   */
  loadZones(): Promise<void>;
}

export const useZoneStore = create<ZoneState>()((set) => ({
  zones: [],
  activeZoneIds: [],
  zonesError: null,
  setZones: (z) => set({ zones: [...z] }),
  setActiveZones: (ids) => set({ activeZoneIds: [...ids] }),

  loadZones: async () => {
    if (!isSupabaseConfigured) {
      set({ zones: MALANG_DISASTER_ZONES, zonesError: null });
      return;
    }
    try {
      const remote = await fetchZones();
      set({ zones: remote.length > 0 ? remote : MALANG_DISASTER_ZONES, zonesError: null });
    } catch (e) {
      set((s) => ({
        zones: s.zones.length > 0 ? s.zones : MALANG_DISASTER_ZONES,
        zonesError: e instanceof Error ? e.message : 'Gagal memuat zona rawan.',
      }));
    }
  },
}));
