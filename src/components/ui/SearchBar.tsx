import { memo } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  value: string;
  onChangeText(text: string): void;
  busy?: boolean;
}

function SearchBarBase({ value, onChangeText, busy }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Cari deskripsi laporan…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Cari laporan"
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={styles.input}
      />
      {busy ? <ActivityIndicator style={styles.spinner} color={colors.primary} /> : null}
    </View>
  );
}

export const SearchBar = memo(SearchBarBase);

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  spinner: { position: 'absolute', right: 14 },
});
