import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface SimpleFormSectionProps {
  title?: string;
  children: ReactNode;
}

export function SimpleFormSection({ title, children }: SimpleFormSectionProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.section, { gap: theme.spacing.md }]}>
      {title ? (
        <AppText accessibilityRole="header" variant="label" weight="bold">
          {title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
});
