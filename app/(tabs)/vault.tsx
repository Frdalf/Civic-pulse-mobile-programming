import { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorText } from '@/components/ui/ErrorText';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { VaultListItem } from '@/components/ui/VaultListItem';
import { colors } from '@/constants/colors';
import { useVault } from '@/hooks/useVault';
import type { VaultDocument } from '@/types';

const keyExtractor = (d: VaultDocument) => d.id;

export default function VaultScreen() {
  const { documents, isLoading, isAdding, error, add, remove, preview } = useVault();

  const confirmRemove = useCallback(
    (doc: VaultDocument) => {
      Alert.alert('Hapus dokumen?', doc.name, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => void remove(doc) },
      ]);
    },
    [remove],
  );

  const renderItem = useCallback<ListRenderItem<VaultDocument>>(
    ({ item }) => <VaultListItem doc={item} onPreview={preview} onRemove={confirmRemove} />,
    [preview, confirmRemove],
  );

  return (
    <ScreenPlaceholder
      title="Document Vault"
      description="Dokumen disimpan privat di penyimpanan aplikasi."
    >
      <View style={styles.actions}>
        <ErrorText message={error} />
        <Button label="Tambah Dokumen" onPress={add} loading={isAdding} />
      </View>
      {isLoading ? (
        // TODO(Orang 1, Minggu 4): ganti dengan skeleton loader.
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada dokumen.</Text>}
        />
      )}
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  actions: { paddingHorizontal: 16, paddingBottom: 12 },
  loading: { marginTop: 24 },
  empty: { marginTop: 24, textAlign: 'center', color: colors.textMuted },
});
