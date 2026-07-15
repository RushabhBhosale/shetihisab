import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { LargeButton } from '@/components/large-button';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface EmptyStateProps {
  icon: FeatherName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { gap: theme.spacing.md }]}>
      <View
        accessible={false}
        style={[
          styles.icon,
          { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.pill },
        ]}>
        <Feather color={theme.colors.primary} name={icon} size={54} />
      </View>
      <AppText accessibilityRole="header" variant="heading" weight="bold" style={styles.center}>
        {title}
      </AppText>
      {description ? (
        <AppText color="secondary" style={styles.center}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={[styles.action, { marginTop: theme.spacing.md }]}>
          <LargeButton icon="plus" onPress={onAction} title={actionLabel} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  icon: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  action: {
    width: '100%',
  },
});
