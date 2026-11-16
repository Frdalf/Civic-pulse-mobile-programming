import type { Session } from '@supabase/supabase-js';

import * as secureStorage from './secureStorage';
import { getSupabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
}

function toAuthUser(session: Session): AuthUser {
  return { id: session.user.id, email: session.user.email ?? '' };
}

async function persist(session: Session): Promise<void> {
  await secureStorage.saveTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  });
}

/** Terjemahkan pesan error Supabase yang umum ke Bahasa Indonesia. */
function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email atau password salah.';
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk Anda.';
  if (m.includes('already registered')) return 'Email sudah terdaftar.';
  if (m.includes('password should be at least')) return 'Password minimal 6 karakter.';
  if (m.includes('network') || m.includes('fetch')) return 'Tidak dapat terhubung ke server.';
  return message;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(translate(error.message));
  if (!data.session) throw new Error('Sesi tidak diterima dari server.');
  await persist(data.session);
  await secureStorage.setCredentialEmail(email);
  return toAuthUser(data.session);
}

export interface SignUpResult {
  /** null jika Supabase mewajibkan konfirmasi email terlebih dulu. */
  user: AuthUser | null;
}

export async function signUp(email: string, password: string, nik?: string): Promise<SignUpResult> {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw new Error(translate(error.message));
  if (nik) await secureStorage.setNik(nik); // NIK hanya disimpan lokal & terenkripsi.
  if (!data.session) return { user: null };
  await persist(data.session);
  await secureStorage.setCredentialEmail(email);
  return { user: toAuthUser(data.session) };
}

/** Pulihkan sesi dari token di secure-store. Mengembalikan null bila tidak ada / kedaluwarsa. */
export async function restoreSession(): Promise<AuthUser | null> {
  const tokens = await secureStorage.getTokens();
  if (!tokens) return null;
  const { data, error } = await getSupabase().auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  if (error || !data.session) {
    await secureStorage.deleteTokens();
    return null;
  }
  await persist(data.session); // token bisa sudah di-refresh
  return toAuthUser(data.session);
}

export async function signOut(): Promise<void> {
  try {
    await getSupabase().auth.signOut();
  } finally {
    // Data lokal tetap dibersihkan walau request ke server gagal.
    await secureStorage.clearAll();
  }
}

/**
 * Simpan ulang token ke secure-store setiap kali Supabase me-refresh sesi.
 * @returns fungsi unsubscribe — WAJIB dipanggil di cleanup useEffect.
 */
export function subscribeTokenRefresh(): () => void {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && session) {
      persist(session).catch(() => {
        // Gagal menyimpan token baru: sesi tetap berjalan di memori,
        // user akan diminta login ulang saat app dibuka kembali.
      });
    }
  });
  return () => data.subscription.unsubscribe();
}
