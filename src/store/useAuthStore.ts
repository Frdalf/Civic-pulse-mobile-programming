import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  login(email: string, pw: string): Promise<void>;
  logout(): Promise<void>;
  /** Baca token dari secure-store. */
  hydrate(): Promise<void>;
}

// Minggu 1: login belum wajib. Implementasi asli (services/auth.ts + secureStorage)
// dikerjakan Minggu 2.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isHydrated: false,

  login: async (_email, _pw) => {
    // TODO(Orang 1, Minggu 2): panggil services/auth.ts, simpan token di secure-store.
    throw new Error('Login belum tersedia (dikerjakan Minggu 2).');
  },

  logout: async () => {
    // TODO(Orang 1, Minggu 2): signOut Supabase + hapus token di secure-store.
    set({ user: null });
  },

  hydrate: async () => {
    // TODO(Orang 1, Minggu 2): baca token dari secure-store & pulihkan sesi.
    set({ isHydrated: true });
  },
}));
