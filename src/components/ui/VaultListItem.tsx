import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { VaultDocument } from '@/types';

interface Props {
  doc: VaultDocument;
  onPreview(doc: VaultDocument): void;
  onRemove(doc: VaultDocument): void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VaultListItemBase({ doc, onPreview, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        style={styles.body}
        onPress={() => onPreview(doc)}
        accessibilityRole="button"
        accessibilityLabel={`Pratinjau ${doc.name}`}
      >
        <Text style={styles.name} numberOfLines={1}>{doc.name}</Text>
        <Text style={styles.meta}>{doc.mimeType} · {formatSize(doc.sizeBytes)}</Text>
      </Pressable>
      <Pressable
        style={styles.remove}
        onPress={() => onRemove(doc)}
        accessibilityRole="button"
        accessibilityLabel={`Hapus ${doc.name}`}
      >
        <Text style={styles.removeText}>Hapus</Text>
      </Pressable>
    </View>
  );
}

export const VaultListItem = memo(VaultListItemBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  body: { flex: 1, padding: 12, minHeight: 56 },
  name: { fontWeight: '600', color: colors.text },
  meta: { marginTop: 2, fontSize: 12, color: colors.textMuted },
  remove: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: colors.danger, fontWeight: '600' },
});
