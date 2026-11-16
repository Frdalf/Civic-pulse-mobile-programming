import { create } from 'zustand';

import * as auth from '@/services/auth';
import { isSupabaseConfigured } from '@/services/supabase';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: { id: string; email: string } | null;
  isHydrated: boolean;
  login(email: string, pw: string): Promise<void>;
  logout(): Promise<void>;
  /** Baca token dari secure-store. */
  hydrate(): Promise<void>;
  /**
   * Tambahan Orang 1 (di luar §5.2). @returns true bila langsung login,
   * false bila Supabase meminta konfirmasi email dulu.
   */
  register(email: string, pw: string, nik?: string): Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isHydrated: false,

  login: async (email, pw) => {
    const user: AuthUser = await auth.signIn(email.trim(), pw);
    set({ user });
  },

  register: async (email, pw, nik) => {
    const { user } = await auth.signUp(email.trim(), pw, nik);
    if (user) set({ user });
    return user !== null;
  },

  logout: async () => {
    try {
      await auth.signOut();
    } finally {
      set({ user: null });
    }
  },

  hydrate: async () => {
    // Tidak pernah reject: bila gagal (mis. offline), user diarahkan ke layar login
    // dan app tidak macet di splash.
    try {
      const user = isSupabaseConfigured ? await auth.restoreSession() : null;
      set({ user, isHydrated: true });
    } catch {
      set({ user: null, isHydrated: true });
    }
  },
}));
