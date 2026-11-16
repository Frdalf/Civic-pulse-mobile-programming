// Milik Orang 1 — logika layar Vault (screen app/(tabs)/vault.tsx tetap tipis).
import { File } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';

import { fileVault } from '@/services/fileVault';
import { useVaultStore } from '@/store';
import type { VaultDocument } from '@/types';

function toMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export function useVault() {
  const documents = useVaultStore((s) => s.documents);
  const setDocuments = useVaultStore((s) => s.setDocuments);
  const addDocument = useVaultStore((s) => s.addDocument);
  const removeDocument = useVaultStore((s) => s.removeDocument);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag `active` mencegah setState setelah unmount (tidak ada subscription lain).
    let active = true;
    fileVault
      .list()
      .then((docs) => active && setDocuments(docs))
      .catch((e: unknown) => active && setError(toMessage(e, 'Gagal memuat dokumen.')))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [setDocuments]);

  const add = useCallback(async () => {
    setError(null);
    setIsAdding(true);
    try {
      const picked = await File.pickFileAsync();
      if (picked.canceled) return;
      addDocument(await fileVault.save(picked.result.uri, picked.result.name));
    } catch (e) {
      setError(toMessage(e, 'Gagal menambah dokumen.'));
    } finally {
      setIsAdding(false);
    }
  }, [addDocument]);

  const remove = useCallback(
    async (doc: VaultDocument) => {
      setError(null);
      try {
        await fileVault.remove(doc);
        removeDocument(doc.id);
      } catch (e) {
        setError(toMessage(e, 'Gagal menghapus dokumen.'));
      }
    },
    [removeDocument],
  );

  const preview = useCallback(async (doc: VaultDocument) => {
    setError(null);
    try {
      const file = new File(doc.uri);
      if (!(await file.canPreview())) {
        setError('Jenis dokumen ini tidak dapat dipratinjau di perangkat.');
        return;
      }
      await file.preview();
    } catch (e) {
      setError(toMessage(e, 'Gagal membuka pratinjau.'));
    }
  }, []);

  return { documents, isLoading, isAdding, error, add, remove, preview };
}
