import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  label: string;
  selected: boolean;
  color?: string;
  onPress(): void;
}

function ChipBase({ label, selected, color = colors.primary, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { borderColor: color },
        selected && { backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

export const Chip = memo(ChipBase);

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  text: { color: colors.text },
  textSelected: { color: '#FFFFFF', fontWeight: '600' },
});
