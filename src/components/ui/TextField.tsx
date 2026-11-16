import { memo } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/constants/colors';

interface Props extends TextInputProps {
  label: string;
}

function TextFieldBase({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, rest.multiline && styles.multiline, style]}
        {...rest}
      />
    </View>
  );
}

export const TextField = memo(TextFieldBase);

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: '600', color: colors.text },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  multiline: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
});
