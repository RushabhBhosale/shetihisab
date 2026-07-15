import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

interface SimpleCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SimpleCard({ children, style }: SimpleCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1.5,
  },
});
