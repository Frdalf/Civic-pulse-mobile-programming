// TODO(Orang 2): implementasi asli (Minggu 2) — stub sementara dari Orang 1 agar layar Vault
// bisa dites. Signature sesuai PROJECT_CONTEXT §5.3, silakan ganti seluruh isi file.
import { Directory, File, Paths } from 'expo-file-system';

import type { VaultDocument } from '@/types';

function vaultDir(): Directory {
  const dir = new Directory(Paths.document, 'vault');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function toDocument(file: File): VaultDocument {
  return {
    id: file.name,
    name: file.name.replace(/^\d+_/, ''),
    uri: file.uri,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    createdAt: new Date(file.creationTime ?? file.modificationTime ?? Date.now()).toISOString(),
  };
}

export const fileVault = {
  async save(uri: string, name: string): Promise<VaultDocument> {
    const safeName = `${Date.now()}_${name.replace(/[^\w.\-]/g, '_')}`;
    const dest = new File(vaultDir(), safeName);
    await new File(uri).copy(dest);
    return toDocument(dest);
  },

  async list(): Promise<VaultDocument[]> {
    return vaultDir()
      .list()
      .filter((x): x is File => x instanceof File)
      .map(toDocument)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async remove(doc: VaultDocument): Promise<void> {
    const file = new File(doc.uri);
    if (file.exists) file.delete();
  },
};
