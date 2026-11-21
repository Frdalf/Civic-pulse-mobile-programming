import { Directory, File, Paths } from 'expo-file-system';

import type { VaultDocument } from '@/types';

/**
 * Mendapatkan direktori Scoped Storage vault (`documentDirectory + 'vault/'`).
 * Membuat folder jika belum tersedia.
 */
function vaultDir(): Directory {
  const dir = new Directory(Paths.document, 'vault');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * Mengonversi `File` expo-file-system menjadi `VaultDocument` sesuai kontrak §5.1.
 */
function toDocument(file: File): VaultDocument {
  const info = file.info();
  return {
    id: file.name,
    name: file.name.replace(/^\d+_/, ''),
    uri: file.uri,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size ?? info.size ?? 0,
    createdAt: new Date(file.creationTime ?? info.creationTime ?? Date.now()).toISOString(),
  };
}

/**
 * Layanan Scoped Storage Document Vault (Orang 2 — Milestone P10).
 * Mengelola penyimpanan berkas lokal di direktori privat aplikasi (`documentDirectory + 'vault/'`).
 */
export const fileVault = {
  /**
   * Menyimpan berkas dari URI ke dalam Scoped Storage vault.
   * Nama berkas diawali timestamp unik untuk mencegah benturan nama.
   */
  async save(uri: string, name: string): Promise<VaultDocument> {
    try {
      const safeName = `${Date.now()}_${name.replace(/[^\w.\-]/g, '_')}`;
      const dest = new File(vaultDir(), safeName);
      const src = new File(uri);
      await src.copy(dest);
      return toDocument(dest);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan dokumen ke vault.';
      throw new Error(msg);
    }
  },

  /**
   * Mengambil daftar seluruh dokumen yang tersimpan di vault, diurutkan dari yang terbaru.
   */
  async list(): Promise<VaultDocument[]> {
    try {
      const dir = vaultDir();
      if (!dir.exists) return [];

      const entries = dir.list();
      return entries
        .filter((x): x is File => x instanceof File)
        .map(toDocument)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.warn('[FileVault] Gagal membaca daftar vault:', error);
      return [];
    }
  },

  /**
   * Menghapus dokumen dari Scoped Storage vault berdasarkan dokumen yang diberikan.
   */
  async remove(doc: VaultDocument): Promise<void> {
    try {
      const file = new File(doc.uri);
      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menghapus dokumen dari vault.';
      throw new Error(msg);
    }
  },
};
