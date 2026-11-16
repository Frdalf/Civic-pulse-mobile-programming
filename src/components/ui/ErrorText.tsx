import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';

function ErrorTextBase({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text style={styles.text} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

export const ErrorText = memo(ErrorTextBase);

const styles = StyleSheet.create({
  text: { color: colors.danger, marginBottom: 12 },
});
