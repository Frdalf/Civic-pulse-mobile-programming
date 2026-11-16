import * as SecureStore from 'expo-secure-store';

/**
 * Penyimpanan data sensitif terenkripsi (Keychain iOS / Keystore Android).
 * JANGAN pakai AsyncStorage untuk data di file ini (PROJECT_CONTEXT §2).
 */

const KEYS = {
  accessToken: 'cp.auth.access_token',
  refreshToken: 'cp.auth.refresh_token',
  nik: 'cp.user.nik',
  credentialEmail: 'cp.user.email',
} as const;

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// --- Token sesi ---------------------------------------------------------------

export async function saveTokens(t: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(KEYS.accessToken, t.accessToken, OPTIONS);
  await SecureStore.setItemAsync(KEYS.refreshToken, t.refreshToken, OPTIONS);
}

export async function getTokens(): Promise<AuthTokens | null> {
  const accessToken = await SecureStore.getItemAsync(KEYS.accessToken, OPTIONS);
  const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken, OPTIONS);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function deleteTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.accessToken, OPTIONS);
  await SecureStore.deleteItemAsync(KEYS.refreshToken, OPTIONS);
}

// --- NIK ---------------------------------------------------------------------

export async function setNik(nik: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.nik, nik, OPTIONS);
}

export async function getNik(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.nik, OPTIONS);
}

export async function deleteNik(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.nik, OPTIONS);
}

// --- Kredensial ----------------------------------------------------------------
// Hanya email terakhir yang disimpan (untuk prefill). Password TIDAK pernah disimpan.

export async function setCredentialEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.credentialEmail, email, OPTIONS);
}

export async function getCredentialEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.credentialEmail, OPTIONS);
}

export async function deleteCredentialEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.credentialEmail, OPTIONS);
}

/** Hapus semua data sensitif (dipakai saat logout). */
export async function clearAll(): Promise<void> {
  await Promise.all([deleteTokens(), deleteNik(), deleteCredentialEmail()]);
}
