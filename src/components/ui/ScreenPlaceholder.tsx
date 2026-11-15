import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

interface Props {
  title: string;
  description?: string;
  children?: ReactNode;
}

function ScreenPlaceholderBase({ title, description, children }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </SafeAreaView>
  );
}

export const ScreenPlaceholder = memo(ScreenPlaceholderBase);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  description: { marginTop: 4, fontSize: 14, color: colors.textMuted },
});
