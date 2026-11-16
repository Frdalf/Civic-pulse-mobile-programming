import { create } from 'zustand';

import type { VaultDocument } from '@/types';

interface VaultState {
  documents: VaultDocument[];
  addDocument(d: VaultDocument): void;
  removeDocument(id: string): void;
  /** Tambahan Orang 1: isi awal dari fileVault.list(). */
  setDocuments(d: VaultDocument[]): void;
}

export const useVaultStore = create<VaultState>()((set) => ({
  documents: [],
  addDocument: (d) =>
    set((s) => ({ documents: [d, ...s.documents.filter((x) => x.id !== d.id)] })),
  removeDocument: (id) => set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })),
  setDocuments: (d) => set({ documents: [...d] }),
}));
