import { isNetworkError } from '@/utils/network';

describe('isNetworkError', () => {
  it.each([
    'TypeError: Network request failed',
    'Gagal mengunggah foto: Failed to fetch',
    'Gagal menyimpan laporan: request timed out',
  ])('true untuk "%s"', (msg) => {
    expect(isNetworkError(new Error(msg))).toBe(true);
  });

  it.each([
    'Gagal menyimpan laporan: new row violates row-level security policy',
    'Gagal mengunggah foto: The resource already exists',
  ])('false untuk "%s"', (msg) => {
    expect(isNetworkError(new Error(msg))).toBe(false);
  });
});
