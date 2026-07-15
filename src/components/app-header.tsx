import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface HeaderAction {
  label: string;
  icon: FeatherName;
  onPress: () => void;
}

interface AppHeaderProps {
  title: string;
  backLabel?: string;
  onBack?: () => void;
  action?: HeaderAction;
}

export function AppHeader({ title, backLabel, onBack, action }: AppHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
      {onBack && backLabel ? (
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Feather color={theme.colors.primary} name="arrow-left" size={25} />
          <AppText color="primary" variant="small" weight="bold">
            {backLabel}
          </AppText>
        </Pressable>
      ) : null}

      <AppText accessibilityRole="header" variant="title" weight="bold" style={styles.title}>
        {title}
      </AppText>

      {action ? (
        <Pressable
          accessibilityLabel={action.label}
          accessibilityRole="button"
          hitSlop={8}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Feather color={theme.colors.primary} name={action.icon} size={25} />
          <AppText color="primary" variant="small" weight="bold">
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    gap: 12,
  },
  title: {
    flexShrink: 1,
  },
  action: {
    minHeight: 52,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.65,
  },
});
