/**
 * Menentukan apakah error disebabkan masalah jaringan (bukan ditolak server).
 * Hanya error jenis ini yang boleh dimasukkan ke antrean offline; error lain
 * (RLS, validasi) harus ditampilkan ke user karena retry tidak akan berhasil.
 */
export function isNetworkError(e: unknown): boolean {
  const message = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return [
    'network request failed',
    'failed to fetch',
    'network error',
    'networkerror',
    'timeout',
    'timed out',
    'internet',
    'offline',
  ].some((needle) => message.includes(needle));
}
